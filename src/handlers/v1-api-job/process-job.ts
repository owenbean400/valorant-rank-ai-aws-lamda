import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent } from "aws-lambda";
import { BEANBALLER_API, OPENAI_API_KEY, VALORANT_AI_JOB_TABLE_NAME } from "../../lib/model/environment.js";
import { JobStatus } from "../../lib/model/status.js";
import { getAnswerChatGpt } from "../../lib/services/openai_helper.js";

const ddb = new DynamoDBClient({});

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        const { jobId, question } = JSON.parse(record.body) as {
            jobId: string;
            question: string;
        };

        let status: JobStatus = "Error";

        if (OPENAI_API_KEY === "" || BEANBALLER_API === "" || question === "") {
            if (OPENAI_API_KEY === "") console.log("OPENAI_API_KEY not configured");
            if (BEANBALLER_API === "") console.log("BEANBALLER_API not configured");

            await ddb.send(new UpdateItemCommand({
                TableName: VALORANT_AI_JOB_TABLE_NAME,
                Key: { jobId: { S: jobId } },
                UpdateExpression: "set #s = :s, result = :r, lastUpdate = :u",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: {
                    ":s": { S: status },
                    ":r": { S: "" },
                    ":u": { S: new Date().toISOString() }
                }
            }));

            return;
        }

        let answer = await getAnswerChatGpt(question) || "";

        status = "Complete";

        await ddb.send(new UpdateItemCommand({
            TableName: VALORANT_AI_JOB_TABLE_NAME,
            Key: { jobId: { S: jobId } },
            UpdateExpression: "set #s = :s, result = :r, lastUpdate = :u",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: {
                ":s": { S: status },
                ":r": { S: answer },
                ":u": { S: new Date().toISOString() }
            }
        }));
    }
};