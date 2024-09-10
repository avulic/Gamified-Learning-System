import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDb extends Document {
    userId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    type: string;
    content: string;
    createdAt: Date;
    readAt?: Date;
    expiresAt?: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    type: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    readAt: Date,
    expiresAt: Date
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotificationDb>('Notification', NotificationSchema);