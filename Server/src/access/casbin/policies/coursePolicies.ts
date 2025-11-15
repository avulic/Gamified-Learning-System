// src/access/policy-impls/courseImpls.ts

import { ABACResult } from "../registry/PolicyRegistry";



export function canViewCourse(course: any, user: any, ctx: any): ABACResult {
    if (course.visibility === 'public') return { allowed: true };
    if (!ctx.enrollment) return { allowed: false, reason: 'Not enrolled' };
    if (ctx.enrollment.status !== 'active') return { allowed: false, reason: 'Enrollment inactive' };
    if (!course.isPublished && !user.roles.includes('professor')) return { allowed: false, reason: 'Course not published' };
    return { allowed: true };
}

export function canEditCourse(course: any, user: any): ABACResult {
    if (user.roles.includes('admin')) return { allowed: true };
    if (user.roles.includes('professor') && course.ownerId === user.id) return { allowed: true };
    return { allowed: false, reason: 'Only course owner or admin can edit' };
}

export function canJoinCourse(course: any, user: any): ABACResult {
    const policy = course.joinPolicy ?? { allowSelfJoin: false, requiresApproval: true };
    if (user.roles.includes('admin') || user.roles.includes('professor')) return { allowed: true };
    if (!policy.allowSelfJoin && policy.requiresApproval) return { allowed: false, reason: 'Enrollment requires instructor approval', meta: { requiresApproval: true } };
    if (!policy.allowSelfJoin) return { allowed: false, reason: 'Course does not allow self-enrollment' };
    return { allowed: true };
}

export function canLeaveCourse(course: any, user: any, ctx: any): ABACResult {
    if (!ctx.enrollment) return { allowed: false, reason: 'Not enrolled' };
    const policy = course.leavePolicy ?? {};
    const now = ctx.now ?? new Date();
    if (policy.allowLeaveUntil && now > new Date(policy.allowLeaveUntil)) return { allowed: false, reason: 'Leave period expired' };
    return { allowed: true };
}
