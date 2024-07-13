import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser, IUserDb } from './User';
import { IRoleDb } from './Role';
import { ICategory } from './Category';
import { IModule } from './Module';
import { CallTrackerCall } from 'assert';

export interface ICourse {
    id:string,
    title: string;
    description: string;
    instructors: string[];
    enrolledStudents: string[];
    modules: string[];
    startDate: Date;
    endDate: Date;
    isPublished: boolean;
    categories: string[];
}

// Course
export interface ICourseDb extends Omit<ICourse, 'id'|'instructors' | 'enrolledStudents' | 'modules' | 'categories'>, Document {
    instructors:  Types.ObjectId[];
    enrolledStudents:  Types.ObjectId[];
    modules:  Types.ObjectId[];
    categories:  Types.ObjectId[];
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

const Course = mongoose.model<ICourseDb>('Course', CourseSchema);

export default Course;