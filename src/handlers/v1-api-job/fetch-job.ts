import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { AiJobFetchResponse } from "../../lib/model/responses.js";
import { VALORANT_AI_JOB_TABLE_NAME } from "../../lib/model/environment.js";

const ddb = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
    let bodyResponse: AiJobFetchResponse;

    try {
        const jobId = event.pathParameters?.jobId;

        if (!jobId) {
            bodyResponse = {
                message: "Missing jobId in path"
            }

            return {
                statusCode: 400,
                body: JSON.stringify(bodyResponse)
            };
        }

        const result = await ddb.send(new GetItemCommand({
            TableName: VALORANT_AI_JOB_TABLE_NAME,
            Key: { jobId: { S: jobId } }
        }));

        if (!result.Item) {
            bodyResponse = {
                message: "Job not found"
            }

            return {
                statusCode: 404,
                body: JSON.stringify(bodyResponse)
            };
        }

        bodyResponse = {
            jobId: result.Item.jobId.S || "",
            status: result.Item.status.S || "",
            question: result.Item.question?.S || "",
            result: result.Item.result?.S || "",
            createAt: result.Item.result?.S || "",
            lastUpdate: result.Item.lastUpdate?.S || ""
        };

        return {
            statusCode: 200,
            body: JSON.stringify(bodyResponse)
        };
    } catch (err) {
        console.error("Error fetching job:", err);

        bodyResponse = {
            message: "Internal server error"
        }

        return {
            statusCode: 500,
            body: JSON.stringify(bodyResponse)
        };
    }
};