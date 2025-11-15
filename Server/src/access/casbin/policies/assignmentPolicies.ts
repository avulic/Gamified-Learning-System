// src/access/policy-impls/assignmentPolicies.ts

import { ABACResult } from "../registry/PolicyRegistry";


export function canUnlockAssignment(enrollment: any, assignment: any, attrs: any, now: Date): ABACResult {
    if (assignment.isPublished === false) return { allowed: false, reason: 'Assignment not published' };
    if (!enrollment) return { allowed: false, reason: 'Not enrolled' };
    // Example: some assignments unlocked only after prerequisites
    if (assignment.unlockAfter && enrollment.completedModules?.includes(assignment.unlockAfter) === false) {
        return { allowed: false, reason: 'Prerequisite not completed' };
    }
    return { allowed: true };
}

export function evaluateSubmissionTime(assignment: any, submittedAt: Date = new Date()): ABACResult {
    const now = submittedAt;
    const window = assignment.submissionWindow ?? null;
    if (!window) return { allowed: true };
    if (now < new Date(window.start)) return { allowed: false, reason: 'Submission window not started' };
    if (now > new Date(window.end)) {
        if (window.allowLateSubmissions) {
            const lateMs = now.getTime() - new Date(window.end).getTime();
            const lateDays = Math.ceil(lateMs / (1000 * 60 * 60 * 24));
            const penaltyPct = Math.min(100, window.lateSubmissionPenalty * lateDays);
            return { allowed: true, meta: { late: true, penaltyPct } };
        }
        return { allowed: false, reason: 'Submission window closed' };
    }
    return { allowed: true };
}

export function canResubmitAssignment(enrollment: any, assignment: any, user: any, submissionHistory: any[]): ABACResult {
    if (!enrollment) return { allowed: false, reason: 'Not enrolled' };
    const maxAttempts = assignment.maxAttempts ?? 1;
    const userAttempts = submissionHistory.filter(s => s.userId === user.id && s.assignmentId === assignment.id).length;
    if (userAttempts >= maxAttempts) {
        return { allowed: false, reason: `Maximum attempts (${maxAttempts}) reached` };
    }
    return { allowed: true, meta: { remainingAttempts: maxAttempts - userAttempts } };
}

export function canViewAssignment(enrollment: any, assignment: any, user: any): ABACResult {
    return canUnlockAssignment(enrollment, assignment, user.attrs, new Date());
}

export function canEditAssignment(assignment: any, user: any): ABACResult {
    if (user.roles.includes('professor') && assignment.createdBy === user.id) return { allowed: true };
    if (user.roles.includes('admin')) return { allowed: true };
    return { allowed: false, reason: 'Only assignment creator or admin can edit' };
}

export function canCommentOnAssignment(assignment: any, user: any): ABACResult {
    const policy = assignment.commentPolicy ?? { allowComments: true, rolesAllowed: ['student', 'professor', 'assistant'] };
    if (!policy.allowComments) return { allowed: false, reason: 'Comments disabled' };
    const hasRole = user.roles.some((r: string) => policy.rolesAllowed.includes(r));
    if (!hasRole) return { allowed: false, reason: 'Role not allowed to comment' };
    return { allowed: true };
}

export function canViewSubmission(submission: any, user: any): ABACResult {
    if (submission.userId === user.id) return { allowed: true };
    if (user.roles.includes('professor') || user.roles.includes('assistant')) return { allowed: true };
    return { allowed: false, reason: 'Only owner or instructor can view' };
}

export function canGradeSubmission(user: any, submission: any): ABACResult {
    if (user.roles.includes('professor')) return { allowed: true };
    if (user.roles.includes('assistant') && submission.courseId === user.attrs.assignedCourseId) return { allowed: true };
    return { allowed: false, reason: 'Not authorized to grade this submission' };
}

export function canOverridePenalty(user: any, submission: any): ABACResult {
    if (user.roles.includes('professor')) return { allowed: true };
    return { allowed: false, reason: 'Only professors can override penalties' };
}
