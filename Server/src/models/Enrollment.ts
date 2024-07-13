import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";

  // Enrollment
  export interface IEnrollment extends Document {
    user: IUser[];
    course: ICourse[];
    enrollmentDate: Date;
    completionStatus: 'in_progress' | 'completed' | 'dropped';
  }
  
  const EnrollmentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    completionStatus: { type: String, enum: ['in_progress', 'completed', 'dropped'], default: 'in_progress' }
  });
  
  export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);