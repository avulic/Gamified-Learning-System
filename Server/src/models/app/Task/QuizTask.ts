import { IBaseTask } from "./BaseTask";
import { IQuestionTask } from "./QuestionTask";


export interface IQuizTask extends IBaseTask {
    content: {
        questions: IQuestionTask[];
    };
    timeLimit?: number;
    passScore: number;
    maxAttempts: number;
}

