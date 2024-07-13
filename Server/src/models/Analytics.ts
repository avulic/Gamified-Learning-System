import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";

  // Analytics
  export interface IAnalytics extends Document {
    course: ICourse[];
    enrollmentCount: number;
    completionRate: number;
    averageRating: number;
    date: Date;
  }
  
  const AnalyticsSchema: Schema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollmentCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  });
  
  export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);