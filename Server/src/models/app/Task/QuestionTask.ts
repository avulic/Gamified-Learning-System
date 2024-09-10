import { Schema } from "mongoose";

import { QuestionType } from "../../enums";
import { IBaseTask } from "./BaseTask";



export interface IQuestionTask extends IBaseTask {
    content: {
        questionType: QuestionType;
        question: string;
        correctAnswer: string;
    };
}
