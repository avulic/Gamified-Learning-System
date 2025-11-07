import { GradingStatus } from '@/models/enums';
import mongoose, { Schema, Document, Types } from 'mongoose';


export class IGradeDb {
    _id?: mongoose.Types.ObjectId;
    status!: GradingStatus;
    gradedBy?: mongoose.Types.ObjectId;
    gradedAt?: Date;
    score?: number;
    feedback?: string;
    rubricScores?: Array<{
        criteriaId: mongoose.Types.ObjectId;
        score: number;
        comment: string;
    }>;
    history?: Array<{
        gradedAt: Date;
        gradedBy: mongoose.Types.ObjectId;
        score: number;
        feedback: string;
    }>;

    version!: number;
}


export const gradeSchema = new Schema({
    status: { type: String, enum: Object.values(GradingStatus), default: GradingStatus.NOT_GRADED },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: Date,
    score: Number,
    feedback: String,
    rubricScores: [{
        criteriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'RubricCriteria' },
        score: { type: Number, required: true },
        comment: { type: String, required: true }
    }],
    history: [{
        gradedAt: { type: Date, required: true },
        gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, required: true },
        feedback: { type: String, required: true }
    }],
    version: Number
}, { 
    timestamps: true 
});


// Add a virtual id field
gradeSchema.virtual('id').get(function() {
    return this._id ? this._id.toString() : undefined;
});




