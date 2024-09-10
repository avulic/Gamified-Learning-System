import { IBaseTask } from "./BaseTask";

// TextTask
export interface ITextTask extends IBaseTask {
    content: {
        text: string;
        minWords?: number;
        maxWords?: number;
    };
    estimatedReadTime: number;
}

