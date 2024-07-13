import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";

  // Feedback
  export interface IFeedback extends Document {
    user: IUser[];
    course: ICourse[];
    rating: number;
    comments: string;
    submissionDate: Date;
  }
  
  const FeedbackSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String },
    submissionDate: { type: Date, default: Date.now }
  });
  
  export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
  
