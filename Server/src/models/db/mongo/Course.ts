import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseDb extends Document {
	title: string;
	description: string;
	instructors: Array<{
		_id: mongoose.Types.ObjectId;
		name: string;
	}>;
	modules: Array<{
		_id: mongoose.Types.ObjectId;
		title: string;
		order: number;
	}>;
	prerequisites: mongoose.Types.ObjectId[];
	categories: string[];
	enrollmentCode: string;
	isPublished: boolean;
	version: number;
	lastUpdated: Date;
	enrolledStudentCount: number;
	xpReward: number;
	materials: string[];
}

const CourseSchema: Schema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructors: [{
		_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		name: String
	}],
	modules: [{
		_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
		title: String,
		order: Number
	}],
	prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
	categories: [String],
	enrollmentCode: { type: String, unique: true },
	isPublished: { type: Boolean, default: false },
	version: { type: Number, default: 1 },
	lastUpdated: { type: Date, default: Date.now },
	enrolledStudentCount: { type: Number, default: 0 },
	xpReward: { type: Number, default: 0 },
	materials: [{ type: String, default: 0 }]
}, {
	timestamps: true
});

CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ categories: 1 });
CourseSchema.index({ 'instructors._id': 1 });

const Course = mongoose.model<ICourseDb>('Course', CourseSchema);
export default Course;