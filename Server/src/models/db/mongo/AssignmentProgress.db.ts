import { ProgressTypeEnum, SubmissionStatus, TaskTypeEnum } from "@/models/enums";
import { AutoMap } from "automapper-classes";
import mongoose, { Types, Schema, Document } from "mongoose";



export class ITaskSubmissionStatusDb {
    status!: SubmissionStatus;
    attempts!: number;
    bestScore?: number;
    lastSubmissionId?: Types.ObjectId;
    taskId!: Types.ObjectId;
    firstAttemptAt?: Date;
    lastAttemptAt?: Date;
    timeSpent!: number;
}


export class IAssignmentProgressDb {
    _id?: Types.ObjectId;
    userId!: Types.ObjectId;
    assignmentId!: Types.ObjectId;
    status!: ProgressTypeEnum;
    startedAt!: Date;
    lastActivityAt!: Date;
    completedAt?: Date;
    tasksProgress!: ITaskSubmissionStatusDb[];
    metrics!: {
        totalTasksAttempted: number;
        totalTasksCompleted: number;
        averageAttemptsPerTask: number;
        averageTimePerTask: number;
        totalTimeSpent: number;
        timeSpentByTaskType: number;
        taskCompletionByType: number;
    };
}



const assignmentProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    status: { type: String, enum: Object.values(ProgressTypeEnum), default: ProgressTypeEnum.IN_PROGRESS },
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    completedAt: Date,
    tasksProgress: [{
        taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
        status: { type: String, enum: Object.values(SubmissionStatus), default: SubmissionStatus.NOT_SUBMITTED },
        attempts: { type: Number, default: 0 },
        bestScore: Number,
        lastSubmissionId: { type: Schema.Types.ObjectId, ref: 'BaseTaskSubmission' },
        firstAttemptAt: { type: Date },
        lastAttemptAt: { type: Date },
        timeSpent: Number
    }],
    metrics: {
        totalTasksAttempted: { type: Number, default: 0 },
        totalTasksCompleted: { type: Number, default: 0 },
        averageAttemptsPerTask: { type: Number, default: 0 },
        averageTimePerTask: { type: Number, default: 0 },
        totalTimeSpent: { type: Number, default: 0 },
        timeSpentByTaskType: {
            [TaskTypeEnum.QUIZ]: { type: Number, default: 0 },
            [TaskTypeEnum.QUESTION]: { type: Number, default: 0 },
            [TaskTypeEnum.CODE]: { type: Number, default: 0 },
            [TaskTypeEnum.FILE_UPLOAD]: { type: Number, default: 0 }
        },
        taskCompletionByType: {
            [TaskTypeEnum.QUIZ]: { 
                attempted: { type: Number, default: 0 },
                completed: { type: Number, default: 0 }
            },
            [TaskTypeEnum.QUESTION]: { 
                attempted: { type: Number, default: 0 },
                completed: { type: Number, default: 0 }
            },
            [TaskTypeEnum.CODE]: { 
                attempted: { type: Number, default: 0 },
                completed: { type: Number, default: 0 }
            },
            [TaskTypeEnum.FILE_UPLOAD]: { 
                attempted: { type: Number, default: 0 },
                completed: { type: Number, default: 0 }
            }
            
        }
    }
}, { 
    timestamps: true 
});


export type AssignmentProgressDocument = Document & IAssignmentProgressDb;
const AssignmentProgressModel = mongoose.model<AssignmentProgressDocument>('AssignmentProgress', assignmentProgressSchema);
export default AssignmentProgressModel;
