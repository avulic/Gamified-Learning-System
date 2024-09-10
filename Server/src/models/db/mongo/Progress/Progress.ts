import mongoose, { Document, Schema, Types } from "mongoose";


export interface IUserProgressDb extends Document {
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

export const UserProgressDb = mongoose.model<IUserProgressDb>('UserProgress', userProgressSchema);



export interface ITaskProgressDb extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    taskId: Types.ObjectId;
    completed: boolean;
    earnedXP: number;
}

const taskProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    completed: { type: Boolean, default: false },
    earnedXP: { type: Number, default: 0 }
});

taskProgressSchema.index({ userId: 1, assignmentId: 1, taskId: 1 });

export const TaskProgressDb = mongoose.model<ITaskProgressDb>('TaskProgress', taskProgressSchema);

