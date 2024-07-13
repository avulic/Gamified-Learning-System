import mongoose, { Schema } from "mongoose";
import { IAssignment } from "./Assigment";
import { IUser } from "./User";

// Submission
export interface ISubmission extends Document {
    student: IUser[];
    assignment: IAssignment[];
    submittedAt: Date;
    content: string;
    grade?: number;
    fileReference: string;
}

const SubmissionSchema: Schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, required: true },
    grade: { type: Number },
    fileReference: { type: String, required: false }
});

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);

