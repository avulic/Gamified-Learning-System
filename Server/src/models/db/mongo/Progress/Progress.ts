import { ProgressType } from "@/models/enums";
import mongoose, { Document, Schema, Types } from "mongoose";


export interface IUserProgressDb {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    totalXP: number;
    level: number;
    overallProgress: number; // Percentage
    courseProgress: CourseProgressDb[];
}

export interface CourseProgressDb {
    courseId: string;
    userId: string;
    totalXP: number;
    level: number;
    overallProgress: number; // Percentage
    moduleProgress: ModuleProgressDb[]; // Array of Module Progress
}

export interface ModuleProgressDb {
    moduleId: Types.ObjectId;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    lessonProgress: LessonProgressDb[];
}

export interface LessonProgressDb {
    lessonId: Types.ObjectId;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    assignmentProgress: AssignmentProgressDb[];
}

export interface AssignmentProgressDb {
    assignmentId: Types.ObjectId;
    submitted: boolean;
    submissionId?: Types.ObjectId;
    earnedXP: number;
    progressPercentage: number;
    taskProgressIds: Types.ObjectId[]; // Array of TaskProgress document IDs
}




const userProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    overallProgress: { type: Number, default: 0 },
    courseProgress: [{
        courseId: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        totalXP: {type: Number},
        level: {type: Number},
        overallProgress: {type: Number}, // Percentage
        moduleProgress: [{
            moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
            completed: { type: Boolean, default: false },
            earnedXP: { type: Number, default: 0 },
            progressPercentage: { type: Number, default: 0 },
            lessonProgress: [{
                lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
                completed: { type: Boolean, default: false },
                earnedXP: { type: Number, default: 0 },
                progressPercentage: { type: Number, default: 0 },
                assignmentProgress: [{
                    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
                    submitted: { type: Boolean, default: false },
                    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
                    earnedXP: { type: Number, default: 0 },
                    progressPercentage: { type: Number, default: 0 },
                    taskProgressIds: [{ type: Schema.Types.ObjectId, ref: 'TaskProgress' }] // Reference to TaskProgress
                }]
            }]
        }]
    }]
    
});

userProgressSchema.index({ userId: 1, courseId: 1 });

export type UserProgressDocument = Document & IUserProgressDb;
export const UserProgressDb = mongoose.model<UserProgressDocument>('UserProgress', userProgressSchema);



export interface ITaskProgressDb  {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    taskId: Types.ObjectId;
    completed: boolean;
    earnedXP: number;
}

const taskProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    status: { type: String, enum: Object.values(ProgressType), default: ProgressType.NOT_STARTED },
    attempts: [{
        submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
        score: Number,
        submittedAt: Date,
        status: String,
    }],
    bestScore: Number,
    lastAttemptAt: Date,
    completedAt: Date,
});



export type TaskProgressDocument = Document & IUserProgressDb;
export const TaskProgress = mongoose.model<TaskProgressDocument>('TaskProgress', taskProgressSchema);
