import { evaluateSubmissionTime } from './timePolicies';

export function canSubmitAssignment(enrollment, assignment, user, submittedAt = new Date()) {
    if (!enrollment) return { allowed: false, reason: 'Not enrolled' };
    const penalty = evaluateSubmissionTime(assignment, submittedAt);
    if (!penalty.allowed) return { allowed: false, reason: penalty.reason };
    return { allowed: true, meta: penalty };
}

export function canViewSubmission(submission, user) {
    if (submission.userId === user.id) return { allowed: true };
    if (user.roles.includes('professor') || user.roles.includes('assistant')) return { allowed: true };
    return { allowed: false, reason: 'Only owner or instructor can view' };
}
