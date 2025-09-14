import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAnswerChatGpt } from "./services/openai_helper.js";
import { BEANBALLER_API, OPENAI_API_KEY } from "./model/environment.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    if (event.requestContext.http.method !== "POST" && event.requestContext.http.path !== "/v1/question") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    if (OPENAI_API_KEY === "" || BEANBALLER_API === "") {
        if (OPENAI_API_KEY === "") {
            console.log("OPENAI_API_KEY not configured");
        }
        if (BEANBALLER_API === "") {
            console.log("BEANBALLER_API not configured");
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: "Server configuration error." })
        }
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const question = body.question || "";

    if (question == "") {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: "Please provide a question or prompt in 'question' of JSON body." }),
        }
    }

    console.log("Received question:", question);

    let response = "";

    response = await getAnswerChatGpt(question) || "";

    if (response == "") {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: "Server error with generating a response." })
        }
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: response }),
    };
};