import { ProgressTypeEnum,TaskTypeEnum } from "@/types/enums";
import { Question } from "./Question";



export class BaseTask {
    id?: string;
    title!: string;
    description!: string;
    taskType!: TaskTypeEnum;
    status!: ProgressTypeEnum;
    points!: number;
    order!: number;
    xpReward!: number;
    requiredForCompletion!: boolean;
    dueDate!: Date;
    assignmentId!: string;
    prerequisites?: string[];
    maxAttempts?: number;
}

// File Upload Task Interface
export class FileUploadTaskContent {
    allowedFileTypes!: string[];
    maxFileSize!: number;
}

export class FileUploadTask extends BaseTask {
    taskType!: TaskTypeEnum.FILE_UPLOAD;
    content!: FileUploadTaskContent;
}

// Question Task Interface
export class QuestionTask extends BaseTask {
    taskType!: TaskTypeEnum.QUESTION;
    content!: Question;
}

// Code Task Interface
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

// Quiz Task Interface
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

// Combined Task Type
export type Task = FileUploadTask | QuestionTask | CodeTask | QuizTask;

