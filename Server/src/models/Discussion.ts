import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';
import { IReply } from './Reply';

// Discussion
export interface IDiscussion extends Document {
    title: string;
    content: string;
    course: ICourse[];
    author: IUser[];
    replies: IReply[][];
    createdAt: Date;
}

const DiscussionSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
    createdAt: { type: Date, default: Date.now }
});

export const Discussion = mongoose.model<IDiscussion>('Discussion', DiscussionSchema);

