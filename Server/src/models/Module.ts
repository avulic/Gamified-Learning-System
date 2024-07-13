import { model, Schema, Document } from 'mongoose';
import { IContentItem } from "./ContentItem";
import { ICourse } from "./Course";

// Module
export interface IModule {
    id:string,
    title: string;
    description: string;
    order: number;
    contentItems: string[];
}

export interface IModuleDb extends Omit<IModule, 'id'|'course' | 'contentItems'>, Document {
    contentItems: IContentItem[];
}

const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },

    order: { type: Number, required: true },
    contentItems: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }]
});


const Module = model<IModuleDb>('Module', ModuleSchema);

export default Module;

