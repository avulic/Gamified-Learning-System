import { QuestionType } from "../enums";


// Base Question Interfaces
export class BaseQuestion {
    id?: string;
    question!: string;
    questionType!: QuestionType;
}

export class MultiChoiceOption {
    text!: string;
    isCorrect!: boolean;
}

export class MultiChoiceQuestion extends BaseQuestion {
    options!: MultiChoiceOption[];
}

export class TrueFalseQuestion extends BaseQuestion {
    correctAnswer!: boolean;
}

export class TextQuestion extends BaseQuestion {
    correctAnswer!: string;
}


export type Question = MultiChoiceQuestion | TrueFalseQuestion | TextQuestion;


