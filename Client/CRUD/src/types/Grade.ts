import { QuestionType } from "./task/Question";
import { TaskTypeEnum } from "./task/Task";


export enum GradeStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export interface Grading {
    // Core grading fields
    submissionId: string;
    assignmentId: string;
    studentId: string;
    graderId: string;

    // Basic grading data
    score: number;
    maxScore: number;
    feedback?: string;
    status: GradeStatus;
    gradedAt: Date;

    // Individual answer scores
    answerScores: Array<{
        answerId: string;
        taskId: string;
        score: number;
        maxScore: number;
        feedback?: string;
    }>;

    // Optional criteria-based scoring
    criteriaScores?: Array<{
        criteriaId: string;
        score: number;
        maxScore: number;
        feedback?: string;
    }>;

    // Basic peer review support
    peerReviews?: Array<{
        reviewerId: string;
        score: number;
        feedback?: string;
        submittedAt: Date;
    }>;

}


// export interface QuestionTaskGrade extends BaseTaskGrade {
//     taskType: TaskTypeEnum.QUESTION;
//     answerGrades: AnswerGrade[];
// }


// export interface FileUploadTaskGrade extends BaseTaskGrade {
//     taskType: TaskTypeEnum.FILE_UPLOAD;
//     fileReview: {
//         fileIds: string[];
//         comments: string[];
//     };
// }


// export interface CodeTaskGrade extends BaseTaskGrade {
//     taskType: TaskTypeEnum.CODE;
//     codeReview: {
//         testResults: TestCaseResult[];
//         codeComments: string[];
//         styleScore?: number;
//     };
// }

// export interface TestCaseResult {
//     passed: boolean;
//     input: string;
//     expectedOutput: string;
//     actualOutput: string;
//     feedback?: string;
// }

// export type TaskGrade = QuestionTaskGrade | FileUploadTaskGrade | CodeTaskGrade;



// export interface MultiChoiceAnswerGrade {
//     questionId: string;

//     questionType: QuestionType.MULTI_CHOICE;
//     correctOptions: string[];
//     selectedOptions: string[];
//     partialCredit: boolean;
// }

// export interface TrueFalseAnswerGrade {
//     questionId: string;

//     questionType: QuestionType.TRUE_FALSE;
//     correctAnswer: boolean;
//     givenAnswer: boolean;
// }

// export interface TextAnswerGrade {
//     questionId: string;

//     questionType: QuestionType.TEXT;
//     comments: string[];
//     keywords?: string[];
// }

// export type AnswerGrade = MultiChoiceAnswerGrade | TrueFalseAnswerGrade | TextAnswerGrade;