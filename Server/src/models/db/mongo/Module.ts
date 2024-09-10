import mongoose, { Schema, Document } from 'mongoose';

export interface IModuleDb extends Document {
	courseId: mongoose.Types.ObjectId;
	title: string;
	description: string;
	order: number;
	xpReward: number;
	badgeReward: string;
	learningObjectives: string[];
	estimatedDuration: number;
	difficulty: number;
	tags: string[];
	publishedAt: Date;
	prerequisitesModulesId: mongoose.Types.ObjectId[];
	lessons: Array<{
		_id: mongoose.Types.ObjectId,
		title: string;
		content: string;
		order: number;
	}>;
	files: Array<{
		_id: mongoose.Types.ObjectId;
		url: string;
		version: number;
		uploadedBy: mongoose.Types.ObjectId;
	}>;
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
		order: { type: Number, default: 0 }
	}],
	files: [{
		_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
		url: { type: String, required: true },
		version: { type: Number, default: 1 },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
	}]
}, {
	timestamps: true
});
ModuleSchema.index({ courseId: 1, order: 1 });

export default mongoose.model<IModuleDb>('Module', ModuleSchema);