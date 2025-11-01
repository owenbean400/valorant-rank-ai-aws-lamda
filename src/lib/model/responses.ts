interface AiJobAcceptResponse {
    response: string;
    jobId: string | null;
}

interface AiJobFetchSuccess {
    jobId: string;
    status: string;
    question: string;
    response: string;
    createAt: string;
    lastUpdate: string;
}

interface AiJobFetchError {
    error: string;
}

type AiJobFetchResponse = AiJobFetchSuccess | AiJobFetchError

export { AiJobAcceptResponse, AiJobFetchResponse };