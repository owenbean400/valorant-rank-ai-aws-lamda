import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent } from "aws-lambda";
import { AWS_REGION, VALORANT_API_URL, OPENAI_API_KEY, VALORANT_AI_JOB_TABLE_NAME, OPENAI_MODEL } from "../../lib/model/environment.js";
import { JobStatus } from "../../lib/model/status.js";
import { getAnswerChatGpt } from "../../lib/services/openai_helper.js";

const ddb = new DynamoDBClient({
    region: AWS_REGION,
});

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            const { jobId, question } = JSON.parse(record.body) as {
                jobId: string;
                question: string;
            };
            let status: JobStatus = "Error";

            try {

                if (OPENAI_API_KEY === "" ||
                        VALORANT_API_URL === "" ||
                        question === "" ||
                        OPENAI_MODEL == "") {
                    if (OPENAI_API_KEY === "") console.error("OPENAI_API_KEY not configured");
                    if (VALORANT_API_URL === "") console.error("VALORANT_API_URL not configured");
                    if (OPENAI_MODEL === "") console.error("OPENAI_MODEL not configured");
                    if (question === "") console.error("question not passed");

                    await ddb.send(new UpdateItemCommand({
                        TableName: VALORANT_AI_JOB_TABLE_NAME,
                        Key: { job_id: { S: jobId } },
                        UpdateExpression: "set #s = :s, #r = :r, last_update = :u",
                        ExpressionAttributeNames: { 
                            "#s": "status",
                            "#r": "response"
                        },
                        ExpressionAttributeValues: {
                            ":s": { S: status },
                            ":r": { S: "Error processing." },
                            ":u": { S: new Date().toISOString() }
                        }
                    }));

                    return;
                }

                let answer = await getAnswerChatGpt(question) || "";

                status = "Complete";

                await ddb.send(new UpdateItemCommand({
                    TableName: VALORANT_AI_JOB_TABLE_NAME,
                    Key: { job_id: { S: jobId } },
                    UpdateExpression: "set #s = :s, #r = :r, last_update = :u",
                    ExpressionAttributeNames: { 
                        "#s": "status",
                        "#r": "response"
                    },
                    ExpressionAttributeValues: {
                        ":s": { S: status },
                        ":r": { S: answer },
                        ":u": { S: new Date().toISOString() }
                    }
                }));
            } catch (error) {
                await ddb.send(new UpdateItemCommand({
                    TableName: VALORANT_AI_JOB_TABLE_NAME,
                    Key: { job_id: { S: jobId } },
                    UpdateExpression: "set #s = :s, #r = :r, last_update = :u",
                    ExpressionAttributeNames: { 
                        "#s": "status",
                        "#r": "response"
                    },
                    ExpressionAttributeValues: {
                        ":s": { S: status },
                        ":r": { S: "General processing error." },
                        ":u": { S: new Date().toISOString() }
                    }
                }));
            }
        } catch (error) {
            console.error("General error.");
        }
    }
};