interface AiJobAcceptResponse {
    response: string;
    jobId: string | null;
}

interface AiJobFetchSuccess {
    jobId: string;
    status: string;
    question: string;
    result: string;
    createAt: string;
    lastUpdate: string;
}

interface AiJobFetchError {
    message: string;
}

type AiJobFetchResponse = AiJobFetchSuccess | AiJobFetchError

export { AiJobAcceptResponse, AiJobFetchResponse };