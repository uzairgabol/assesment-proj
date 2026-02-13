const {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand
} = require("@aws-sdk/client-dynamodb");

const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { createHandler } = require("../../src/handlerFactory");

const TABLE_NAME = "TestTable";

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fake",
    secretAccessKey: "fake"
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

async function waitForTable() {
  while (true) {
    try {
      await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
      break;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

describe("Integration - local DynamoDB", () => {

  const handler = createHandler({
    dynamodb,
    s3: {},
    table: TABLE_NAME,
    bucket: "test"
  }).handler;

  beforeAll(async () => {
    try {
      await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    } catch {}

    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" }
      ],
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" }
      ],
      BillingMode: "PAY_PER_REQUEST"
    }));

    await waitForTable();
  });

  afterAll(async () => {
    await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
  });

  it("writes to real DynamoDB", async () => {

    const event = {
      rawPath: "/patients/p100/notes",
      body: JSON.stringify({ content: "Integration note" }),
      requestContext: {
        http: { method: "POST" },
        authorizer: {
          jwt: {
            claims: {
              sub: "user1",
              email: "test@test.com",
              "custom:clinic_id": "clinic1",
              "custom:role": "doctor"
            }
          }
        }
      }
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(201);
  });
});