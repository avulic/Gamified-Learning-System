// src/models/app/AuditLog.entity.ts
//this to log all access control decisions, submissions, or overrides

import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: string;                 // who performed or attempted the action
    actorId?: string | null;        // who performed on behalf of someone (e.g. admin override)
    action: string;                 // e.g. 'submit', 'overridePenalty', 'view', 'unlockAttempt'
    resourceType: string;           // e.g. 'assignment', 'submission'
    resourceId?: string | null;     // e.g. assignmentId
    decision?: 'allow' | 'deny';    // access decision outcome
    meta?: Record<string, any>;     // arbitrary context (penalty %, reason, etc.)
    timestamp: Date;                // when it occurred
}

const AuditLogSchema = new Schema<IAuditLog>({
    userId: { type: String, required: true, index: true },
    actorId: { type: String, default: null },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: null },
    decision: { type: String, enum: ['allow', 'deny'], default: 'allow' },
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: () => new Date(), index: true }
});

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);
