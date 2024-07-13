import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IRoleDb } from './Role';
import { ICategory } from './Category';
import { IModule } from './Module';

// Course
export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: IUser[];
    enrolledStudents: IUser[];
    modules: IModule[];
    startDate: Date;
    endDate: Date;
    isPublished: boolean;
    categories: ICategory[];
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);

