import { QuestionType } from "@/types/enums";


// Base Answer Interface
export class BaseAnswer {
    id?: string;
    taskId!: string;
    questionId!: string;
    questionType!: QuestionType;
    submittedAt!: Date;
    isCorrect?: boolean;
    score?: number;
}

// Multiple Choice Answer
export class MultiChoiceAnswer extends BaseAnswer {
    questionType!: QuestionType.MULTI_CHOICE;
    selectedOptionIds!: string[];
}

// True/False Answer
export class TrueFalseAnswer extends BaseAnswer {
    questionType!: QuestionType.TRUE_FALSE;
    answer!: boolean;
}

// Text Answer
export class TextAnswer extends BaseAnswer {
    questionType!: QuestionType.TEXT;
    answer!: string;
    matchedKeywords?: string[];
}

// Combined Answer Type
export type Answer = MultiChoiceAnswer | TrueFalseAnswer | TextAnswer;
