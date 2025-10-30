import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { AiJobFetchResponse } from "../../lib/model/responses.js";
import { AWS_REGION, VALORANT_AI_JOB_TABLE_NAME } from "../../lib/model/environment.js";

const ddb = new DynamoDBClient({
    region: AWS_REGION,
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    if (event.requestContext.http.method !== "GET" && event.requestContext.http.path.startsWith("/v1/question/job/")) {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method not allowed." }),
        };
    }

    if (VALORANT_AI_JOB_TABLE_NAME === "") {
        console.error("VALORANT_AI_JOB_TABLE_NAME not configured");
        return {
            statusCode: 503,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Server not available." }),
        };
    }

    let bodyResponse: AiJobFetchResponse;

    try {
        const jobId = event.pathParameters?.jobId;

        if (!jobId) {
            bodyResponse = {
                message: "Missing jobId in parameter path."
            }

            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyResponse)
            };
        }

        const result = await ddb.send(new GetItemCommand({
            TableName: VALORANT_AI_JOB_TABLE_NAME,
            Key: { job_id: { S: jobId } }
        }));

        if (!result.Item) {
            bodyResponse = {
                message: "Job not found."
            }

            return {
                statusCode: 404,
                body: JSON.stringify(bodyResponse)
            };
        }

        bodyResponse = {
            jobId: result.Item.job_id.S || "",
            status: result.Item.status.S || "",
            question: result.Item.question?.S || "",
            response: result.Item.response?.S || "",
            createAt: result.Item.create_at?.S || "",
            lastUpdate: result.Item.last_update?.S || ""
        };

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyResponse)
        };
    } catch (err) {
        let errorString = "";

        if (err instanceof Error) {
            errorString = err.message;
        } else {
            errorString = String(err);
        }

        console.error("Error fetching job:", err);

        bodyResponse = {
            message: "Server error."
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyResponse)
        };
    }
};