export interface TrueFalseChoiceOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface TrueFalse {
    id: string;
    taskId: string;
    question: string;
    options: TrueFalseChoiceOption[];
    points: number;
}

export default TrueFalse;