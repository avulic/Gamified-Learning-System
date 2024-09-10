import { BaseContent } from "../BaseContent";
import MultiChoice from "../task/question/MultiChoise";
import {Question} from "../task/question/Question";
import { BaseTask } from "../task/Task";

// Quiz Content
export interface QuizContent {
    questions: Question[];
}

// Quiz Task
interface Quiz extends BaseTask {
    content: QuizContent;
    timeLimit?: number;
    passScore: number;
    maxAttempts: number;
}
export default Quiz;