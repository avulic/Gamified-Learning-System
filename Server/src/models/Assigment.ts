import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";

// Assignment
export interface IAssignment extends Document {
    title: string;
    description: string;
    dueDate: Date;
    course: ICourse[];
    totalPoints: number;
    fileReference: string;
}

const AssignmentSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    totalPoints: { type: Number, required: true },
    fileReference: { type: String, required: false }
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);



