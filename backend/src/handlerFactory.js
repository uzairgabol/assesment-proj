const { PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

function createHandler({ dynamodb, s3, table, bucket }) {

  /* ==============================
     AUTH / ROLE CONFIGURATION
  ============================== */

  const permissions = {
    doctor: ["create", "read", "update", "presign"],
    nurse: ["read"],
    admin: ["read", "delete"]
  };

  function requirePermission(user, action) {
    const allowed = permissions[user.role] || [];
    if (!allowed.includes(action)) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
  }

  const parseToken = (event) => {
    const claims = event.requestContext.authorizer.jwt.claims;

    if (!claims?.sub || !claims["custom:clinic_id"] || !claims["custom:role"]) {
      const err = new Error("Invalid token claims");
      err.statusCode = 401;
      throw err;
    }

    return {
      userId: claims.sub,
      email: claims.email,
      clinicId: claims["custom:clinic_id"],
      role: claims["custom:role"]
    };
  };

  const response = (statusCode, body) => ({
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  });

  /* ==============================
     NOTE OPERATIONS
  ============================== */

  async function createNote(event, user) {
    requirePermission(user, "create");

    const patientId = (event.rawPath || event.path).split("/")[2];
    const body = JSON.parse(event.body);

    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const item = {
      PK: `${user.clinicId}#${patientId}`,
      SK: `NOTE#${now}#${noteId}`,
      noteId,
      patientId,
      clinicId: user.clinicId,
      authorId: user.userId,
      authorEmail: user.email,
      content: body.content,
      tags: body.tags || [],
      studyDate: body.studyDate || null,
      attachmentKey: body.attachmentKey || null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    await dynamodb.send(new PutCommand({ TableName: table, Item: item }));
    return response(201, item);
  }

  async function listNotes(event, user) {
    requirePermission(user, "read");

    const patientId = (event.rawPath || event.path).split("/")[2];
    const params = event.queryStringParameters || {};

    const result = await dynamodb.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${user.clinicId}#${patientId}`,
        ":sk": "NOTE#"
      },
      ScanIndexForward: false,
      Limit: parseInt(params.limit) || 20
    }));

    let items = (result.Items || []).filter(i => !i.deletedAt);

    if (params.tag) {
      items = items.filter(i => i.tags.includes(params.tag));
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      items = items.filter(i =>
        i.content.toLowerCase().includes(search)
      );
    }

    return response(200, {
      notes: items,
      cursor: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
        : null
    });
  }

  async function getNote(event, user) {
    requirePermission(user, "read");

    const parts = (event.rawPath || event.path).split("/");
    const patientId = parts[2];
    const noteId = parts[4];

    const result = await dynamodb.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${user.clinicId}#${patientId}`,
        ":sk": "NOTE#"
      }
    }));

    const note = (result.Items || []).find(
      item => item.noteId === noteId && !item.deletedAt
    );

    if (!note) return response(404, { error: "Note not found" });

    return response(200, note);
  }

  async function updateNote(event, user) {
    requirePermission(user, "update");

    const parts = (event.rawPath || event.path).split("/");
    const patientId = parts[2];
    const noteId = parts[4];
    const body = JSON.parse(event.body);

    const result = await dynamodb.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${user.clinicId}#${patientId}`,
        ":sk": "NOTE#"
      }
    }));

    const note = (result.Items || []).find(
      item => item.noteId === noteId && !item.deletedAt
    );

    if (!note) return response(404, { error: "Note not found" });

    // Optional: Only author or admin can update
    if (user.role !== "admin" && note.authorId !== user.userId) {
      return response(403, { error: "You can only update your own notes" });
    }

    if (body.version !== note.version) {
      return response(409, { error: "Version conflict" });
    }

    const now = new Date().toISOString();

    const updated = {
      ...note,
      content: body.content ?? note.content,
      tags: body.tags ?? note.tags,
      studyDate: body.studyDate ?? note.studyDate,
      attachmentKey: body.attachmentKey ?? note.attachmentKey,
      version: note.version + 1,
      updatedAt: now
    };

    await dynamodb.send(new PutCommand({ TableName: table, Item: updated }));

    return response(200, updated);
  }

  async function deleteNote(event, user) {
    requirePermission(user, "delete");

    const parts = (event.rawPath || event.path).split("/");
    const patientId = parts[2];
    const noteId = parts[4];

    const result = await dynamodb.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${user.clinicId}#${patientId}`,
        ":sk": "NOTE#"
      }
    }));

    const note = (result.Items || []).find(
      item => item.noteId === noteId && !item.deletedAt
    );

    if (!note) return response(404, { error: "Note not found" });

    note.deletedAt = new Date().toISOString();

    await dynamodb.send(new PutCommand({ TableName: table, Item: note }));

    return response(204, {});
  }

  async function presignUpload(event, user) {
    requirePermission(user, "presign");

    const body = JSON.parse(event.body);

    const key = `${user.clinicId}/${Date.now()}_${body.filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.contentType
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return response(200, { url, key });
  }

  /* ==============================
     ROUTER
  ============================== */

  return {
    handler: async (event) => {
      try {
        const user = parseToken(event);
        const path = event.rawPath || event.path;
        const method = event.requestContext.http.method;

        if (path.match(/\/patients\/[^/]+\/notes$/) && method === "POST")
          return await createNote(event, user);

        if (path.match(/\/patients\/[^/]+\/notes$/) && method === "GET")
          return await listNotes(event, user);

        if (path.match(/\/patients\/[^/]+\/notes\/[^/]+$/) && method === "GET")
          return await getNote(event, user);

        if (path.match(/\/patients\/[^/]+\/notes\/[^/]+$/) && method === "PUT")
          return await updateNote(event, user);

        if (path.match(/\/patients\/[^/]+\/notes\/[^/]+$/) && method === "DELETE")
          return await deleteNote(event, user);

        if (path === "/attachments/presign" && method === "POST")
          return await presignUpload(event, user);

        return response(404, { error: "Not found" });

      } catch (err) {
        return response(err.statusCode || 500, {
          error: err.message
        });
      }
    }
  };
}

module.exports = { createHandler };