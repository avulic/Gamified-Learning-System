import { Schema } from "mongoose";
import { IBaseTask } from "./BaseTask";


interface IMultiChoiceOption {
    text: string;
    isCorrect: boolean;
}

export interface IMultiChoiceTask extends IBaseTask {
    content: {
        question: string;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
    };
}