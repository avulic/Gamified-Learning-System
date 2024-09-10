import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsDb extends Document {
  courseId: mongoose.Types.ObjectId;
  date: Date;
  engagementMetrics: {
    averageTimeSpent: number;
    resourceAccessCount: number;
    forumPostCount: number;
  };
  performanceMetrics: {
    averageScore: number;
    completionRate: number;
  };
  studentRiskAnalysis: Array<{
    userId: mongoose.Types.ObjectId;
    riskLevel: string;
    factors: string[];
  }>;
}

const AnalyticsSchema: Schema = new Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, default: Date.now },
  engagementMetrics: {
    averageTimeSpent: Number,
    resourceAccessCount: Number,
    forumPostCount: Number
  },
  performanceMetrics: {
    averageScore: Number,
    completionRate: Number
  },
  studentRiskAnalysis: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    riskLevel: String,
    factors: [String]
  }]
});

AnalyticsSchema.index({ courseId: 1, date: -1 });

export default mongoose.model<IAnalyticsDb>('Analytics', AnalyticsSchema);	