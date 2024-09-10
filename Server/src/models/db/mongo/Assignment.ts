import { TaskTypeEnum } from '@/models/enums';
import mongoose, { Schema, Document } from 'mongoose';
import { BaseTaskSchema, FileUploadTaskSchema, ITaskDb, MultiChoiceTaskSchema, QuestionTaskSchema } from './Task';

export interface IAssignmentDb extends Document {
    updatedAt: Date;
    createdAt: Date;
    courseId: mongoose.Types.ObjectId;
    moduleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    totalPoints: number;
    assignmentType: string;
    tasks: ITaskDb[];
    rubric: {
        criteria: Array<{
            criterion: string;
            points: number;
        }>;
    };
    peerReviewSettings: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
}
const AssignmentSchema: Schema = new Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    totalPoints: { type: Number, required: true },
    assignmentType: { type: String, required: true },
    tasks: [BaseTaskSchema],
    rubric: {
        criteria: [{
            criterion: String,
            points: Number
        }]
    },
    peerReviewSettings: {
        enabled: { type: Boolean, default: false },
        reviewsPerStudent: Number,
        dueDate: Date
    }
}, {
    timestamps: true
});

AssignmentSchema.path<Schema.Types.Subdocument>('tasks').discriminator(TaskTypeEnum.MULTI_CHOICE, MultiChoiceTaskSchema);
AssignmentSchema.path<Schema.Types.Subdocument>('tasks').discriminator(TaskTypeEnum.FILE_UPLOAD, FileUploadTaskSchema);
AssignmentSchema.path<Schema.Types.Subdocument>('tasks').discriminator(TaskTypeEnum.QUESTION, QuestionTaskSchema);

// Indexes
AssignmentSchema.index({ courseId: 1, dueDate: 1 });
AssignmentSchema.index({ moduleId: 1 });


const Assignment = mongoose.model<IAssignmentDb>('Assignment', AssignmentSchema);
export default Assignment;