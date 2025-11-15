// src/access/policies/grading.policies.ts

import { canGradeSubmission, canOverridePenalty } from "../policies/assignmentPolicies";
import { PolicyRegistry } from "./PolicyRegistry";

PolicyRegistry.register('submission', 'grade', {
    id: 'submission.grade.allowed',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'submission' && ctx.action === 'grade',
    execute: ({ user, resource }) => canGradeSubmission(user, resource)
}, 'all');

PolicyRegistry.register('submission', 'override-penalty', {
    id: 'submission.overridePenalty',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'submission' && ctx.action === 'override-penalty',
    execute: ({ user, resource }) => canOverridePenalty(user, resource)
}, 'all');
