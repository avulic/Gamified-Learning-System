import { canUnlockAssignment, evaluateSubmissionTime } from "../policies/timePolicies";
import { PolicyRegistry } from "./PolicyRegistry";

/**
 * Assignment unlock policy
 */
PolicyRegistry.register('assignment', 'unlock', {
    id: 'assignment.unlock.rules',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'assignment' && ctx.action === 'unlock',
    execute: ({ user, resource, ctx }) =>
        canUnlockAssignment(ctx.enrollment, resource, user.attrs, ctx.now)
}, 'all');

/**
 * Submission time evaluation
 */
PolicyRegistry.register('submission', 'evaluate-time', {
    id: 'submission.evaluateTime',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'submission' && ctx.action === 'evaluate-time',
    execute: ({ resource, ctx }) =>
        evaluateSubmissionTime(resource.assignment, resource.submittedAt, ctx.now)
}, 'all');
