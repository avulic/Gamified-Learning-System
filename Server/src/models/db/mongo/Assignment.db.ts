import { TaskTypeEnum } from '@/models/enums';
import mongoose, { Schema, Document, Types, model } from 'mongoose';

import { AutoMap } from 'automapper-classes';
import { ParentType } from '@/models/app/Assignment.entity';
import { IBaseTaskDb, ITaskDb } from './Task.db';

export class IAssignmentDb {
    _id!: Types.ObjectId;
    title!: string;
    description!: string;
    parentType!: ParentType;
    parentId!: Types.ObjectId;
    createdBy!: Types.ObjectId;
    tasks!: ITaskDb[];
    rubric?: {
        criteria: Array<{
            criterion: string;
            points: number;
        }>;
    };
    peerReviewSettings?: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
    maxAttempts?: number;
    passingScore!: number;
    points!: number;
    submissionWindow!: {
        start: Date,
        end: Date,
        allowLateSubmissions: boolean,
        lateSubmissionPenalty: number  // percentage
    };
}

const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    parentType: {
        type: String,
        enum: ParentType,
        required: true
    },
    parentId: { type: Schema.Types.ObjectId, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rubric: {
        criteria: [{
            criterion: String,
            points: Number,
        }]
    },
    peerReviewSettings: {
        enabled: { type: Boolean, default: false },
        reviewsPerStudent: { type: Number, default: 0 },
        dueDate: Date
    },
    maxAttempts: { type: Number, default: 1 },  //TO-DO remove
    passingScore: { type: Number },             //TO-DO remove
    points: { type: Number },                   //TO-DO remove/agregate
    submissionWindow: {
        start: Date,
        end: Date,
        allowLateSubmissions: Boolean,
        lateSubmissionPenalty: Number  // number/points
    }
});



export type AssignmentDocument = Document & IAssignmentDb;
const Assignment = model<AssignmentDocument>('Assignment', assignmentSchema);

export default Assignment;