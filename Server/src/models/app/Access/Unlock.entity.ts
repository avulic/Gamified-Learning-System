// src/models/app/Unlock.entity.ts
/*
e.g., nightly job or on enrollment change).
Your frontend can query GET /api/unlocks?userId=... to quickly know what’s accessible — no ABAC compute required on every request.
*/

import { Schema, model, Document } from 'mongoose';

export interface IUnlock extends Document {
    userId: string;
    contentId: string;
    contentType: 'course' | 'module' | 'assignment' | 'lesson' | 'task';
    unlockedAt: Date;
}

const UnlockSchema = new Schema<IUnlock>({
    userId: { type: String, required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String, required: true },
    unlockedAt: { type: Date, default: () => new Date() }
});

UnlockSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

export const UnlockModel = model<IUnlock>('Unlock', UnlockSchema);
