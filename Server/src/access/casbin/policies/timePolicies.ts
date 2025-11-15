import { ABACResult } from "../registry/PolicyRegistry";

export function now(): Date {
    return new Date();
}

export function canUnlockAssignment(enrollment: any, assignment: any, userAttrs: any = {}, serverNow: Date = now()): ABACResult {
    if (!enrollment) return { allowed: false, reason: 'Not enrolled' };

    if (assignment.absoluteUnlockDate && serverNow < new Date(assignment.absoluteUnlockDate))
        return { allowed: false, reason: `Locked until ${new Date(assignment.absoluteUnlockDate).toISOString()}` };

    if (assignment.lockAfterDays && enrollment.enrolledAt) {
        const unlockDate = new Date(enrollment.enrolledAt);
        unlockDate.setUTCDate(unlockDate.getUTCDate() + (assignment.lockAfterDays || 0));
        if (serverNow < unlockDate)
            return { allowed: false, reason: `Locked until ${unlockDate.toISOString()}`, meta: { unlockDate } };
    }

    const progress = enrollment.progressPct ?? 0;
    if ((assignment.minProgressPct ?? 0) > progress)
        return { allowed: false, reason: `Progress ${progress}% < required ${assignment.minProgressPct}%` };

    return { allowed: true };
}

export function evaluateSubmissionTime(assignment: any, submittedAt: Date, serverNow: Date = now()) {
    const due = new Date(assignment.dueDate);
    const policy = assignment.latePolicy ?? { allowLate: true, penaltyPctPerDay: 10, maxPenaltyPct: 50 };

    if (submittedAt <= due)
        return { allowed: true, late: false, daysLate: 0, penaltyPct: 0 };

    if (!policy.allowLate)
        return {
            allowed: false,
            late: true,
            daysLate: Math.ceil((submittedAt.getTime() - due.getTime()) / 86400000),
            penaltyPct: 0,
            reason: 'Late submissions not allowed'
        };

    const daysLate = Math.ceil((submittedAt.getTime() - due.getTime()) / 86400000);
    const penalty = Math.min(policy.maxPenaltyPct, (policy.penaltyPctPerDay ?? 10) * daysLate);

    return { allowed: true, late: true, daysLate, penaltyPct: penalty };
}
