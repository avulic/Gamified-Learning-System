import mongoose, { Schema } from "mongoose";
import { IUser } from "./User";

  // Notification
  export interface INotification extends Document {
    user: IUser[];
    content: string;
    type: 'assignment' | 'discussion' | 'grade' | 'announcement';
    isRead: boolean;
    createdAt: Date;
  }
  
  const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['assignment', 'discussion', 'grade', 'announcement'], required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  
  export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
  
