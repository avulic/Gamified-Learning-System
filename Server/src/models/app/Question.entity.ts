import { AutoMap } from "automapper-classes";
import { QuestionType } from "../enums";

// Base Question Interfaces
export class BaseQuestion {
    @AutoMap()
    id?: string;
    @AutoMap()
    question!: string;

    @AutoMap(() => String)
    questionType!: QuestionType;
}

export class MultiChoiceOption {
    @AutoMap()
    text!: string;

    @AutoMap()
    isCorrect!: boolean;

    id?: string;
}

export class MultiChoiceQuestion extends BaseQuestion {
    @AutoMap(() => [MultiChoiceOption])
    options!: MultiChoiceOption[];
}

export class TrueFalseQuestion extends BaseQuestion {
    @AutoMap()
    correctAnswer!: boolean;
}

export class TextQuestion extends BaseQuestion {
    @AutoMap()
    correctAnswer!: string;
}


export type Question = MultiChoiceQuestion | TrueFalseQuestion | TextQuestion;


