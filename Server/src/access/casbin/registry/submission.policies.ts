// src/access/policies/course.policies.ts

import { canSubmitAssignment, canSubmitTask, canViewSubmission } from "../policies/submissionPolicies";
import { PolicyRegistry } from "./PolicyRegistry";


// view (AND semantics)
PolicyRegistry.register('submission', 'submit', {
    id: 'submission.submit.basic',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'submission' && ctx.action === 'submit',
    execute: ({ user, resource, ctx }) => canSubmitTask(resource, user, ctx)
}, 'all');

// edit
PolicyRegistry.register('submission', 'view', {
    id: 'submission.view.ownerOrAdmin',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'submission' && ctx.action === 'view',
    execute: ({ user, resource }) => canViewSubmission(resource, user)
}, 'all');

