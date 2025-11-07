import { AutoMap } from 'automapper-classes';
import mongoose, { Schema, Document } from 'mongoose';

export class ILessonDb{
    @AutoMap()
    _id!: mongoose.Types.ObjectId;
    @AutoMap()
    title!: string;
    @AutoMap()
    content!: string;
    @AutoMap()
    order!: number;
    @AutoMap(()=>[mongoose.Types.ObjectId])
    assignmentIds!: mongoose.Types.ObjectId[];
    @AutoMap(()=>[mongoose.Types.ObjectId])
    fileIds!: mongoose.Types.ObjectId[];
}

export class IModuleDb {
    @AutoMap()
    _id?: mongoose.Types.ObjectId;
    @AutoMap()
    courseId!: mongoose.Types.ObjectId;
    @AutoMap()
    title!: string;
    @AutoMap()
    description!: string;
    @AutoMap()
    order!: number;
    @AutoMap()
    xpReward!: number;
    @AutoMap()
    badgeReward!: string;
    @AutoMap()
    learningObjectives!: string[];
    @AutoMap()
    estimatedDuration!: number;
    @AutoMap()
    difficulty!: number;
    @AutoMap()
    tags!: string[];
    @AutoMap()
    publishedAt!: Date;
    @AutoMap()
    prerequisitesModulesId!: mongoose.Types.ObjectId[];
    @AutoMap(()=> [ILessonDb])
    lessons!: ILessonDb[];
    @AutoMap()
    assignmentIds?: mongoose.Types.ObjectId[];
    @AutoMap()
    fileIds?: mongoose.Types.ObjectId[];
}

const ModuleSchema: Schema = new Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, required: true },
    xpReward: { type: Number, default: 0 },
    badgeReward: { type: String, default: "" },
    learningObjectives: { type: [String], default: [] },
    estimatedDuration: { type: Number, default: 0 },
    difficulty: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date, default: Date.now },
    prerequisitesModulesId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: [] }],
    lessons: [{
        _id: { type: mongoose.Schema.Types.ObjectId},
        title: { type: String, required: true },
        content: { type: String, default: "" },
        order: { type: Number, default: 0 },
        assignmentIds: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
        fileIds: [{ type: Schema.Types.ObjectId, ref: 'File' }]
    }],
    assignmentIds: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
    fileIds: [{ type: Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});


ModuleSchema.index({ courseId: 1, order: 1 });

export type ModuleDocument = Document & IModuleDb;
const Module = mongoose.model<ModuleDocument>('Module', ModuleSchema);
export default Module;