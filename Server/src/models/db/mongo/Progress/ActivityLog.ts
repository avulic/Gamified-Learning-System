import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
    user: mongoose.Types.ObjectId;
    action: string;
    entity: {
        kind: string;
        item: mongoose.Types.ObjectId;
    };
    metadata: Record<string, any>;
    timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: {
        kind: { type: String, required: true },
        item: { type: Schema.Types.ObjectId, refPath: 'entity.kind', required: true }
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ 'entity.kind': 1, 'entity.item': 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);