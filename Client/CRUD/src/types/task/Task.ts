import MultiChoice from "./question/MultiChoise";
import {Question} from "./question/Question";
import { ProgressTypeEnum } from "../Progression";
import { BaseContent } from "../BaseContent";
import Quiz from "../quiz/Quiz";

export enum TaskTypeEnum {
    MULTI_CHOICE = "multi_choice",
    QUESTION = 'question',
    QUIZ = 'quiz',
    FILE_UPLOAD = 'file_upload',
    TEXT = 'text'
}

// Base Task Interface
export interface BaseTask {
    id: string;
    assignmentId: string;
    taskType: TaskTypeEnum;
    status: ProgressTypeEnum;
    dueDate?: Date;
    title: string;
    description: string;
    xpReward: number;
    requiredForCompletion: boolean;
    createdAt: Date;
    updatedAt: Date;
}


// export interface Task {
//     assignmentId: string;
//     type: TaskTypeEnum;
//     status: ProgressTypeEnum;
//     dueDate?: Date;
//     weight: number; // Percentage weight in the assignment's total score
//     submissionSettings?: SubmissionSettings | null;
    
//     allowedFileTypes?: string[];
//     maxFileSize?: number;
//     dependencies?: string[];

//     requiredForCompletion: boolean;
//     content?: TaskContent[] | null;
// }

export interface SubmissionSettings {
    required: boolean;
    attemptsAllowed: number;
    submissionType: 'file' | 'text' | 'code' | 'choice';
    allowLateSubmissions: boolean;
    latePenalty?: number; // Percentage penalty for late submissions
}



// Quiz Content
export interface TextContent {
    questions: Question[];
    minWords?: number;
    maxWords?: number;
}

interface FileUploadContent {
    type: 'fileUpload';
    allowedFileTypes: string[];
    maxFileSize: number;
}

interface TestCase {
    input: string;
    expectedOutput: string;
}



export interface CodeSubmissionTask extends BaseTask {
    language: string;
    testCases?: TestCase[];
}

// Other task types (for completeness)
export interface TextTask extends BaseTask {
    content: TextContent[];
    estimatedReadTime: number;
}

export interface UploadTask extends BaseTask {
    content: FileUploadContent;
    dueDate: Date;
    submissionSettings?: SubmissionSettings | null;
}

// Union type for all task types
type Task = Quiz | TextTask | UploadTask;



export default Task;