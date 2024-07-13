import mongoose, { Schema } from "mongoose";
import { IContentItem } from "./ContentItem";
import { ICourse } from "./Course";

// Module
export interface IModule extends Document {
    title: string;
    description: string;
    course: ICourse[];
    order: number;
    contentItems: IContentItem[];
}

const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true },
    contentItems: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }]
});

export const Module = mongoose.model<IModule>('Module', ModuleSchema);

