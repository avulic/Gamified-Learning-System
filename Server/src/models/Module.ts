import mongoose, { Schema } from "mongoose";
import { IContentItem } from "./ContentItem";
import { ICourse } from "./Course";

// Module
export interface IModule {
    id:string,
    title: string;
    description: string;
    course: string[];
    order: number;
    contentItems: string[];
}

export interface IModuleDb extends Omit<IModule, 'id'|'course' | 'contentItems'>, Document {
    course: ICourse[];
    contentItems: IContentItem[];
}

const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true },
    contentItems: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }]
});

const Module = mongoose.model<IModuleDb>('Module', ModuleSchema);

export default Module;