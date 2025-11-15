// src/access/policy-impls/gradingImpls.ts

import { ABACResult } from "../registry/PolicyRegistry";


export function canGradeSubmission(user: any, submission: any): ABACResult {
    if (user.roles.includes('professor')) return { allowed: true };
    if (user.roles.includes('assistant') && submission.courseId && submission.courseId === user.attrs?.assignedCourseId) return { allowed: true };
    return { allowed: false, reason: 'Not authorized to grade this submission' };
}

export function canOverridePenalty(user: any, submission: any): ABACResult {
    if (user.roles.includes('professor')) return { allowed: true };
    return { allowed: false, reason: 'Only professors can override penalties' };
}
