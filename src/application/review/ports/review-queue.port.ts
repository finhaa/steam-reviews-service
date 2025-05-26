export const REVIEW_QUEUE_PORT = 'REVIEW_QUEUE_PORT';

export interface JobStatus {
  status: string;
  progress: number;
  result?: any;
  error?: string;
}

export interface ReviewQueuePort {
  queueSync(gameId: number): Promise<{ jobId: string; message: string }>;
  getJobStatus(jobId: string): Promise<JobStatus>;
}
