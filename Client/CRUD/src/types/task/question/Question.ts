// src/types/Quiz.ts

import MultiChoice from "./MultiChoise";
import QuestionText from "./QuestionText";
import TrueFalse from "./TrueFalse";


// export interface QuestionBase {
//     content: QuestionText | MultiChoice | TrueFalse;
// }


// Question Types
export enum QuestionType {
    TRUE_FALSE = 'true_false',
    TEXT = 'text',
    MULTI_CHOICE = 'multi_choice'
}

interface BaseQuestion {
    id: string;
    taskId: string;
    questionType: QuestionType;
    question: string;
    points: number;
}

interface MultiChoiceOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface MultiChoiceQuestion extends BaseQuestion {
    questionType: QuestionType.MULTI_CHOICE;
    options: MultiChoiceOption[];
}

export interface TrueFalseQuestion extends BaseQuestion {
    questionType: QuestionType.TRUE_FALSE;
    correctAnswer: boolean;
}

export interface TextQuestion extends BaseQuestion {
    questionType: QuestionType.TEXT;
    correctAnswer: string;
}

export type Question = MultiChoiceQuestion | TrueFalseQuestion | TextQuestion;


