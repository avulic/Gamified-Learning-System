import { SubmissionStatus, TaskTypeEnum, ProgressTypeEnum } from '@/models/enums';
import mongoose, { Schema, Document } from 'mongoose';
import { answerSchema, FileUploadAnswer, IAnswerDb, MultiChoiceAnswer, QuestionAnswer } from './Answer';



export interface ISubmissionDb extends Document {
	userId: mongoose.Types.ObjectId;
	assignmentId: mongoose.Types.ObjectId;
	status: SubmissionStatus;
	submittedAt: Date;
	lastUpdatedAt: Date;
	attemptNumber: number;
	timeSpent?: number;
	isLate: boolean;
	isPartial: boolean;

	grade?: number;
	gradedBy?: mongoose.Types.ObjectId;
	gradedAt?: Date;
	
	answers: IAnswerDb[];

	peerReviews?: Array<{
		reviewerId: mongoose.Types.ObjectId;
		score: number;
		comments: string;
	}>;
	plagiarismScore?: number;
}



const SubmissionSchema: Schema = new Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
	status: { type: String, enum: Object.values(SubmissionStatus), required: true },
	submittedAt: { type: Date, required: true },
	lastUpdatedAt: { type: Date, required: true },
	attemptNumber: { type: Number, required: true },
	timeSpent: { type: Number },
	isLate: { type: Boolean, required: true },
	isPartial: { type: Boolean, required: true },
	grade: { type: Number },
	gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	gradedAt: { type: Date },
	answers: [answerSchema],
	peerReviews: [{
		reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		score: Number,
		comments: String
	}],
	plagiarismScore: { type: Number}
}, { timestamps: true });


SubmissionSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });
SubmissionSchema.index({ courseId: 1, submittedAt: -1 });

const Submission = mongoose.model<ISubmissionDb>('Submission', SubmissionSchema);
export default Submission;