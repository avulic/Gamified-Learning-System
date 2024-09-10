export enum SubmissionStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    GRADED = 'graded',
    LATE = 'late'
}


export interface Submission {
    id: string;
    userId: string;
    assignmentId: string;
    taskId?: string;
    content: string | File;
    submissionType: 'file' | 'text' | 'code' | 'choice';
    status: SubmissionStatus;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    gradedAt?: Date;
    xpEarned: number;
    attempts: number;
    latePenalty?: number;
}
