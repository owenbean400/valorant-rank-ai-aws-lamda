
# Valorant AI Rank Chatbot API

An AWS-hosted Node.js API that lets users ask AI-powered questions about a Valorant player's rank history.

---

## 🏗️ Overview

This project uses a **serverless architecture** built on AWS, integrating:

* **Lambda** — compute functions for handling different tasks
* **DynamoDB** — data storage for questions and responses
* **API Gateway** — public API access point
* **SQS** — job queue for processing AI tasks asynchronously

---

## ☁️ AWS Setup

### 🗄️ DynamoDB

DynamoDB stores user questions and AI-generated responses.

* **Partition Key:** `job_id` (String)
* Each record represents a question job and its corresponding AI answer.

---

### 🌐 API Gateway

Create an **HTTP API Gateway** to route external API requests to Lambda functions.

#### **POST /v1/question** — Accept Job

Integrates with the **Accept Job Lambda**.
This endpoint receives user questions and creates a new AI job.

#### **GET /v1/question/job/{jobId}** — Fetch Job

Integrates with the **Fetch Job Lambda**.
This endpoint retrieves the status and AI response for a given job.

---

### 📬 SQS (Simple Queue Service)

Set up an **SQS queue** to handle AI job requests.

* Make sure the **Default Visibility Timeout** is **long enough** for Lambda execution (the AI function can take **over 30 minutes**).
* Add the **Process Job Lambda** as a trigger for this queue.

---

## ⚙️ Lambda Functions

This project includes multiple Lambda microservices.

Run the following command to build all Lambda function folders:

```bash
npm run build
```

Each Lambda build will output a folder (e.g., `accept-job`, `fetch-job`, `process-job`) in the `dist/` directory.
You'll need to **zip each folder's `index.js`** file for manual upload to AWS Lambda.

All functions use the **Node.js 22.x runtime**.

---

### 📨 Accept Job Function

Handles incoming user questions and enqueues jobs for processing.

* **Build Folder:** `accept-job`

#### Environment Variables

| Key                          | Description                                                                                                                                                                        | Required |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `JOB_QUEUE_URL`              | SQS queue URL for AI job processing. [Docs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-message-identifiers.html#sqs-general-identifiers) | ✅ Yes    |
| `VALORANT_AI_JOB_TABLE_NAME` | DynamoDB table name.                                                                                                                                                               | ✅ Yes    |
| `AWS_REGION`                 | AWS region for SQS and DynamoDB. Default: `us-east-1`.                                                                                                                             | ❌ No     |

#### IAM Role Permissions

Replace `AWS_SQS_ARN` and `AWS_DYNAMODB_ARN` with your actual resource ARNs.

```json
{
  "Statement": [
    {
      "Sid": "AllowDynamoDBWrite",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem"],
      "Resource": "AWS_DYNAMODB_ARN"
    },
    {
      "Sid": "AllowSQSSend",
      "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": "AWS_SQS_ARN"
    }
  ]
}
```

---

### 🔍 Fetch Job Function

Retrieves job status and AI responses from DynamoDB.

* **Build Folder:** `fetch-job`

#### Environment Variables

| Key                          | Description                                    | Required |
| ---------------------------- | ---------------------------------------------- | -------- |
| `VALORANT_AI_JOB_TABLE_NAME` | DynamoDB table name.                           | ✅ Yes    |
| `AWS_REGION`                 | AWS region for DynamoDB. Default: `us-east-1`. | ❌ No     |

#### IAM Role Permissions

Replace `AWS_DYNAMODB_ARN` with your DynamoDB ARN.

```json
{
  "Statement": [
    {
      "Sid": "AllowDynamoDBRead",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem"],
      "Resource": "AWS_DYNAMODB_ARN"
    }
  ]
}
```

---

### ⚙️ Process Job Function

Consumes messages from the SQS queue, queries Valorant rank data, and generates responses using the OpenAI API.

* **Build Folder:** `process-job`

#### Environment Variables

| Key                          | Description                                                                                                | Required |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| `OPENAI_API_KEY`             | API key for OpenAI. [Setup](https://platform.openai.com/api-keys)                                          | ✅ Yes    |
| `OPENAI_MODEL`               | OpenAI model name. [Models](https://platform.openai.com/docs/models)                                       | ✅ Yes    |
| `VALORANT_RANK_PLAYER`       | Player name to personalize responses.                                                                      | ❌ No     |
| `VALORANT_API_URL`           | API endpoint for fetching Valorant rank data. [Repo](https://github.com/owenbean400/valorant-rank-aws-api) | ✅ Yes    |
| `VALORANT_AI_JOB_TABLE_NAME` | DynamoDB table name.                                                                                       | ✅ Yes    |
| `AWS_REGION`                 | AWS region for SQS and DynamoDB. Default: `us-east-1`.                                                     | ❌ No     |

#### IAM Role Permissions

Replace `AWS_SQS_ARN` and `AWS_DYNAMODB_ARN` with your resource ARNs.

```json
{
  "Statement": [
    {
      "Sid": "AllowDynamoDBUpdate",
      "Effect": "Allow",
      "Action": ["dynamodb:UpdateItem"],
      "Resource": "AWS_DYNAMODB_ARN"
    },
    {
      "Sid": "AllowSQSAccess",
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "AWS_SQS_ARN"
    }
  ]
}
```