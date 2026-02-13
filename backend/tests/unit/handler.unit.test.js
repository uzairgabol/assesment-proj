const { createHandler } = require("../../src/handlerFactory");

describe("Unit - createNote", () => {

  it("creates a note", async () => {
    const mockSend = jest.fn().mockResolvedValue({});

    const handler = createHandler({
      dynamodb: { send: mockSend },
      s3: {},
      table: "TestTable",
      bucket: "test"
    }).handler;

    const event = {
      rawPath: "/patients/p1/notes",
      body: JSON.stringify({ content: "Hello world" }),
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
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});