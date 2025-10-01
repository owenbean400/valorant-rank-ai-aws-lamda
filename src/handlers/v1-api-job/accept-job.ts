import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { JobStatus } from "../../lib/model/status.js";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_REGION, JOB_QUEUE_URL, VALORANT_AI_JOB_TABLE_NAME } from "../../lib/model/environment.js";
import { AiJobAcceptResponse } from "../../lib/model/responses.js";

const ddb = new DynamoDBClient({
    region: AWS_REGION,
});
const sqs = new SQSClient({
    region: AWS_REGION,
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    if (event.requestContext.http.method !== "POST" && event.requestContext.http.path !== "/v1/question") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    if (VALORANT_AI_JOB_TABLE_NAME === "" || JOB_QUEUE_URL === "") {
        if (VALORANT_AI_JOB_TABLE_NAME === "") console.error("VALORANT_AI_JOB_TABLE_NAME not configured");
        if (JOB_QUEUE_URL === "") console.error("JOB_QUEUE_URL not configured");
        return {
            statusCode: 503,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Server not available." }),
        };
    }

    const bodyRequest = event.body ? JSON.parse(event.body) : {};
    const question = bodyRequest.question || "";
    const jobId = uuidv4();
    const status: JobStatus = "Pending";
    let bodyResponse: AiJobAcceptResponse;

    if (question == "") {
        bodyResponse = {
            response: "Please provide a question or prompt in 'question' of JSON body.",
            jobId: null
        }

        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyResponse),
        }
    }

    try {
        await ddb.send(new PutItemCommand({
            TableName: VALORANT_AI_JOB_TABLE_NAME,
            Item: {
                job_id: { S: jobId },
                status: { S: status },
                question: { S: question },
                response: { S: "" },
                create_at: { S: new Date().toISOString() },
                last_update: { S: new Date().toISOString() }
            }
        }));

        await sqs.send(new SendMessageCommand({
            QueueUrl: JOB_QUEUE_URL,
            MessageBody: JSON.stringify({ jobId, question })
        }));

        bodyResponse = {
            response: "AI Question job has been accepted",
            jobId: jobId
        }
        
        return {
            statusCode: 202,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyResponse)
        };
    } catch (error) {
        bodyResponse = {
            response: "Internal Server Error",
            jobId: null
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyResponse)
        };
    }
}