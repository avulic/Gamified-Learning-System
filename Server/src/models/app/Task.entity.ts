import { SubmissionPolicy, TaskTypeEnum } from '../enums';
import { Question } from './Question.entity';



export class BaseTask {
    id?: string;
    title!: string;
    description!: string;
    taskType!: TaskTypeEnum;
    points!: number;
    order!: number;
    xpReward!: number;
    requiredForCompletion!: boolean;
    assignmentId!: string;
    prerequisites?: string[];
    maxAttempts?: number;
    submissionWindow!: {
        start: Date,
        end: Date,
        allowLateSubmissions: boolean,
        lateSubmissionPenalty: number  // percentage
    }
    submissionPolicy?: SubmissionPolicy = SubmissionPolicy.BEST_SCORE;
    // NEW: estimated minutes for ETA calculation and scheduling
    estimatedMinutes?: number;
}


export class FileUploadTaskContent {
    allowedFileTypes!: string[];
    maxFileSize!: number;
}

export class FileUploadTask extends BaseTask {
    taskType!: TaskTypeEnum.FILE_UPLOAD;
    content!: FileUploadTaskContent;
}

export class QuestionTask extends BaseTask {
    taskType!: TaskTypeEnum.QUESTION;
    content!: Question;
}


export class CodeTestCase {
    input!: string;
    expectedOutput!: string;
    isHidden?: boolean;
}

export class CodeTaskContent {
    question?: string;
    language!: string;
    initialCode?: string;
    testCases!: CodeTestCase[];
}

export class CodeTask extends BaseTask {
    taskType!: TaskTypeEnum.CODE;
    content!: CodeTaskContent;
}


export class QuizTaskContent {
    questions!: Question[];
    timeLimit?: number;
    passingScore?: number;
    maxAttempts?: number;
}

export class QuizTask extends BaseTask {
    taskType!: TaskTypeEnum.QUIZ;
    content!: QuizTaskContent;
}


export type Task = FileUploadTask | QuestionTask | CodeTask | QuizTask;

