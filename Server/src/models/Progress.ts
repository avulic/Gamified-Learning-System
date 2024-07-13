import mongoose, { Schema } from "mongoose";
import { IContentItem } from "./ContentItem";
import { ICourse } from "./Course";
import { IModule } from "./Module";
import { IUser } from "./User";

// Progress
export interface IProgress extends Document {
    user: IUser[];
    course: ICourse[];
    completedModules: IModule[][];
    lastAccessedContent: IContentItem[];
    overallProgress: number;
}

const ProgressSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedModules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    lastAccessedContent: { type: Schema.Types.ObjectId, ref: 'ContentItem' },
    overallProgress: { type: Number, default: 0 }
});

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);

