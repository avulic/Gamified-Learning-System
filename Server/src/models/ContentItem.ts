import mongoose, { Schema } from "mongoose";
import { IModule } from "./Module";

export enum ItemType {
    Video = 'video',
    Text = 'text',
    Quiz = 'quiz',
}

export interface IContentItem {
    id: string;
    title: string;
    type: ItemType,
    content: string;
    module: string;
    order: number;
}

// ContentItem
export interface IContentItemDb extends Omit<IContentItem, 'module'>, Document {
    module: IModule[];
}

const ContentItemSchema: Schema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ItemType, required: true },
    content: { type: String, required: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    order: { type: Number, required: true }
});

export const ContentItem = mongoose.model<IContentItemDb>('ContentItem', ContentItemSchema);

