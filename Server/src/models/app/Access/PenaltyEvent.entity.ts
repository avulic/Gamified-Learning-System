// src/models/app/PenaltyEvent.entity.ts
/*
Whenever a professor overrides a penalty or manually adjusts a score, log an event here.
You can link it to AuditLog for traceability.
*/

import { Schema, model, Document } from 'mongoose';

export interface IPenaltyEvent extends Document {
    submissionId: string;
    userId: string;           // owner of submission
    actorId: string;          // who applied / changed the penalty (e.g. professor)
    previousPenaltyPct: number;
    newPenaltyPct: number;
    reason?: string;
    createdAt: Date;
}

const PenaltyEventSchema = new Schema<IPenaltyEvent>({
    submissionId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    actorId: { type: String, required: true },
    previousPenaltyPct: { type: Number, default: 0 },
    newPenaltyPct: { type: Number, required: true },
    reason: { type: String, default: '' },
    createdAt: { type: Date, default: () => new Date() }
});

export const PenaltyEventModel = model<IPenaltyEvent>('PenaltyEvent', PenaltyEventSchema);
