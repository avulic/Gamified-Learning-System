import mongoose, { Schema, Document } from 'mongoose';

export interface IAchivmentDb {
    userId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    type: string;
    content: string;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    type: { type: String, required: true },
    content: { type: String, required: true },
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AchivmentDocument = Document & IAchivmentDb;
export default mongoose.model<AchivmentDocument>('Notification', NotificationSchema);