import mongoose, { Schema, Document } from 'mongoose';


interface IEmbeddedModule {
    _id: mongoose.Types.ObjectId;
    title: string;
    order: number;
}

export class ICourseDb {
    _id?: mongoose.Types.ObjectId;
	title!: string;
	description!: string;
	instructors!: Array<{
		_id: mongoose.Types.ObjectId;
		name: string;
	}>;
    modules?: Array<IEmbeddedModule>;
	prerequisites?: mongoose.Types.ObjectId[];
	categories!: string[];
	enrollmentCode!: string;
	isPublished!: boolean;
	version!: number;
	lastUpdated!: Date;
	enrolledStudentCount!: number;
	xpReward!: number;
	assignmentIds?: mongoose.Types.ObjectId[];
    fileIds?: mongoose.Types.ObjectId[];
}


const CourseSchema: Schema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	instructors: {
        type: [{
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String
        }],
        default: []      
    },
    modules: [{
        // Reference to Module
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
        title: String,
        order: Number
    }],
	prerequisites: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        default: []      
    },
	categories: { type: [String], default: [] },
	enrollmentCode: { type: String, unique: true },
	isPublished: { type: Boolean, default: false },
	version: { type: Number, default: 1 },
	lastUpdated: { type: Date, default: Date.now },
	enrolledStudentCount: { type: Number, default: 0 },
	xpReward: { type: Number, default: 0 },
	assignmentIds: [{ type: Schema.Types.ObjectId, ref: 'Assignment', default: [] }],
    fileIds: [{ type: Schema.Types.ObjectId, ref: 'File', default: [] }]
}, {
	timestamps: true
});


CourseSchema.pre('save', function(next) {
    // Update lastUpdated timestamp on every save
    this.lastUpdated = new Date();
    next();
});

CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ 'instructors._id': 1 });

export type CourseDocument = Document & ICourseDb;
const CourseModel = mongoose.model<CourseDocument>('Course', CourseSchema);
export default CourseModel;