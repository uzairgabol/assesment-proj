# SnoreMD Notes API – Development & Deployment Guide

This repository contains the backend and frontend configuration for the SnoreMD Notes Management System. It uses a serverless architecture with AWS Lambda, DynamoDB, S3, and Cognito.

## 🚀 System Architecture
The system follows a standard serverless pattern:
* **Frontend:** React SPA (Single Page Application).
* **Auth:** AWS Cognito User Pool with custom attributes.
* **API:** Amazon API Gateway with Cognito Authorizer.
* **Logic:** AWS Lambda (Node.js 22+).
* **Storage:** DynamoDB (NoSQL) and S3 (Attachments).



---

## 1️⃣ Infrastructure Setup (AWS Console / CLI)

### IAM Role: `snoreMd`
Create an IAM execution role for the Lambda function with the following configurations:

1. **Policy Attachment:** Attach `AWSLambdaBasicExecutionRole` (for CloudWatch Logs).
2. **Inline Policy:** Create a custom policy for resource access:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:GetItem",
				"dynamodb:Query",
				"dynamodb:UpdateItem"
			],
			"Resource": "arn:aws:dynamodb:ap-south-1:565393060634:table/SnoreMDNotes"
		},
		{
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject"
			],
			"Resource": "arn:aws:s3:::snore-md-attachments/*"
		}
	]
}

```

### Authentication: AWS Cognito

1. **User Pool:** Create a new User Pool.
2. **App Client:** Select "Single Page Application" (SPA).
3. **Auth Flows:** Enable the following:
* `ALLOW_USER_AUTH` (Choice-based sign-in)
* `ALLOW_USER_PASSWORD_AUTH` (Direct username/password)
* `ALLOW_USER_SRP_AUTH` (Secure Remote Password)
* `ALLOW_REFRESH_TOKEN_AUTH` (Token renewal)


4. **Custom Attributes:** Add the following custom attributes to users:
* `custom:role`: (`doctor`, `nurse`, or `admin`)
* `custom:clinic_id`: (e.g., `clinic_001`)



### API Gateway & Routing

Create a REST API and attach the Lambda function using a **Cognito Authorizer** on all routes.

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/patients/{patientId}/notes` | Create a new clinical note |
| **GET** | `/patients/{patientId}/notes` | List all notes for a patient |
| **GET** | `/patients/{patientId}/notes/{noteId}` | Get specific note details |
| **PUT** | `/patients/{patientId}/notes/{noteId}` | Update an existing note |
| **DELETE** | `/patients/{patientId}/notes/{noteId}` | Soft-delete/Remove a note |
| **POST** | `/attachments/presign` | Get S3 URL for file uploads |

---

## 2️⃣ Backend Deployment

1. **Install:** `npm install`
2. **Test:** `npm test`
3. **Bundle:** Zip the `src` directory and `node_modules`.
4. **Upload:** Deploy the `.zip` to the Lambda function associated with the `snoreMd` role.
5. **Handler Setup:** Change handler runtime setup to src/handler.handler
---

## 3️⃣ Frontend Setup

### Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd frontend
npm install

```

### Environment Configuration

Create a `.env` file in the root of the frontend folder:

```env
REACT_APP_COGNITO_REGION=ap-south-1
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
REACT_APP_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_API_BASE_URL=[https://xxxxxxx.execute-api.ap-south-1.amazonaws.com/prod](https://xxxxxxx.execute-api.ap-south-1.amazonaws.com/prod)

```

### Run Locally

```bash
npm start

```

---

## 4️⃣ Local Testing (Mocked Environment)

To run the local DynamoDB container for integration testing:

```bash
# Start local DB
docker compose -f docker/docker-compose.yml up -d

# Run integration suite
npm run test:integration

```

---

## 🎯 Summary of Workflow

1. **Auth:** User logs in via Cognito (Frontend).
2. **Token:** Frontend receives a JWT (ID Token).
3. **Request:** Frontend sends request to API Gateway with `Authorization: Bearer <token>`.
4. **Verify:** API Gateway Authorizer validates the token with Cognito.
5. **Execute:** Lambda processes logic, reading/writing to `SnoreMDNotes` table.