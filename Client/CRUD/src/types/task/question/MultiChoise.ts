
interface MultiChoiceOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface MultiChoiceQuestion extends BaseQuestion {
    questionType: QuestionType.MULTI_CHOICE;
    options: MultiChoiceOption[];
}

export default MultiChoiceQuestion;