const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const { createHandler } = require("./handlerFactory");

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const { handler } = createHandler({
  dynamodb,
  s3,
  table: process.env.TABLE_NAME,
  bucket: process.env.BUCKET_NAME
});

exports.handler = handler;