// src/access/policies/assignment.policies.ts

import { canResubmitAssignment, canEditAssignment, canCommentOnAssignment, canViewSubmission, canGradeSubmission, canOverridePenalty } from "../policies/assignmentPolicies";
import { evaluateSubmissionTime, canUnlockAssignment } from "../policies/timePolicies";
import { PolicyRegistry } from "./PolicyRegistry";


// submit action: must satisfy enrollment, submission window/time penalty, attempts
PolicyRegistry.register('assignment', 'submit', {
    id: 'assignment.submit.enrollment',
    priority: 200,
    applies: ({ resource }) => !!resource && resource.type === 'assignment',
    execute: ({ user, resource, ctx }) => {
        // if enrollment not present, deny
        if (!ctx.enrollment) return { allowed: false, reason: 'Not enrolled' };
        return { allowed: true };
    }
}, 'all');

PolicyRegistry.register('assignment', 'submit', {
    id: 'assignment.submit.time',
    priority: 100,
    applies: ({ resource, ctx }) => !!resource && resource.type === 'assignment' && !!resource.submissionWindow,
    execute: ({ resource, ctx }) => evaluateSubmissionTime(resource, ctx.submittedAt ?? ctx.now)
}, 'all');

PolicyRegistry.register('assignment', 'submit', {
    id: 'assignment.submit.attempts',
    priority: 90,
    applies: ({ resource, ctx }) => !!resource && resource.type === 'assignment' && Array.isArray(ctx.submissionHistory),
    execute: ({ user, resource, ctx }) => canResubmitAssignment(ctx.enrollment, resource, user, ctx.submissionHistory)
}, 'all');

// view action: unlock check
PolicyRegistry.register('assignment', 'view', {
    id: 'assignment.view.unlock',
    priority: 200,
    applies: ({ resource }) => resource?.type === 'assignment',
    execute: ({ user, resource, ctx }) => canUnlockAssignment(ctx.enrollment, resource, user.attrs, ctx.now)
}, 'all');

// edit action: owner or professor
PolicyRegistry.register('assignment', 'edit', {
    id: 'assignment.edit.owner',
    priority: 200,
    applies: ({ resource }) => resource?.type === 'assignment',
    execute: ({ user, resource }) => canEditAssignment(resource, user)
}, 'all');

// comment action: role / policy driven (OR semantics could make sense but we use all currently)
PolicyRegistry.register('assignment', 'comment', {
    id: 'assignment.comment',
    priority: 100,
    applies: ({ resource }) => resource?.type === 'assignment',
    execute: ({ user, resource }) => canCommentOnAssignment(resource, user)
}, 'all');

// submission.view action
PolicyRegistry.register('submission', 'view', {
    id: 'submission.view.ownerOrInstructor',
    priority: 200,
    applies: ({ resource }) => resource?.type === 'submission',
    execute: ({ user, resource }) => canViewSubmission(resource, user)
}, 'all');

// grading
PolicyRegistry.register('submission', 'grade', {
    id: 'submission.grade.allowed',
    priority: 200,
    applies: ({ resource }) => resource?.type === 'submission',
    execute: ({ user, resource }) => canGradeSubmission(user, resource)
}, 'all');

PolicyRegistry.register('submission', 'override-penalty', {
    id: 'submission.overridePenalty',
    priority: 200,
    applies: ({ resource }) => resource?.type === 'submission',
    execute: ({ user, resource }) => canOverridePenalty(user, resource)
}, 'all');
