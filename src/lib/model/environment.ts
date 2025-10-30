const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "";
const VALORANT_RANK_PLAYER = getEnvironmentLettersAndNumberOnly(process.env.VALORANT_RANK_PLAYER);
const VALORANT_API_URL = process.env.VALORANT_API_URL || "";
const JOB_QUEUE_URL = process.env.JOB_QUEUE_URL || "";
const VALORANT_AI_JOB_TABLE_NAME = process.env.VALORANT_AI_JOB_TABLE_NAME || "";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

function getEnvironmentLettersAndNumberOnly(input: string | undefined): string {
    if (input && /^[a-zA-Z0-9]+$/.test(input)) {
        return input;
    }
    return "";
}

export { OPENAI_API_KEY, OPENAI_MODEL, VALORANT_API_URL, VALORANT_RANK_PLAYER, JOB_QUEUE_URL, VALORANT_AI_JOB_TABLE_NAME, AWS_REGION };