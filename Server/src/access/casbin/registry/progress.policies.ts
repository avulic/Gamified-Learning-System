// src/access/registry/ProgressPolicyRegistry.ts

import { canStartProgress, canSubmit, canUpdateTask, computeProgressMetrics, isAssignmentComplete } from "../policies/progressPolicies";
import { PolicyRegistry } from "./PolicyRegistry";


//
// CATEGORY: PROGRESS
//

// -----------------------------------------------
// PROGRESS.START
// -----------------------------------------------
PolicyRegistry.register(
    "progress",
    "start",
    {
        id: "progress.start",
        priority: 200,
        applies: ({ resource, ctx }) => !!resource && !!ctx,
        execute: ({ user, resource, ctx }) =>
            canStartProgress(user, resource, ctx)
    },
    "all" // applies to all roles unless RBAC blocks before ABAC
);

// -----------------------------------------------
// SUBMISSION.SUBMIT
// Used inside SubmissionService before create()
// -----------------------------------------------
PolicyRegistry.register(
    "submission",
    "submit",
    {
        id: "submission.submit",
        priority: 200,
        applies: ({ resource, ctx }) => !!resource && !!ctx,
        execute: ({ user, resource, ctx }) =>
            canSubmit(user, resource /* task */, ctx)
    },
    "all"
);

// -----------------------------------------------
// PROGRESS.TASK.UPDATE
// ABAC gate for per-task update inside updateProgressFromSubmissions
// -----------------------------------------------
PolicyRegistry.register(
    "progress",
    "task.update",
    {
        id: "progress.task.update",
        priority: 300,
        applies: ({ resource, ctx }) =>
            !!resource && !!resource.task && !!ctx,
        execute: ({ user, resource, ctx }) =>
            canUpdateTask(user, resource, ctx)
    },
    "all"
);

// -----------------------------------------------
// PROGRESS.METRICS.COMPUTE
// Service computes metrics only after ABAC allows it
// -----------------------------------------------
PolicyRegistry.register(
    "progress",
    "metrics.compute",
    {
        id: "progress.metrics.compute",
        priority: 100,
        applies: ({ resource, ctx }) => !!resource && !!ctx,
        execute: ({ user, resource, ctx }) =>
            computeProgressMetrics(user, resource, ctx)
    },
    "all"
);

// -----------------------------------------------
// PROGRESS.ASSIGNMENT.COMPLETE
// Final completion check guard
// -----------------------------------------------
PolicyRegistry.register(
    "progress",
    "assignment.complete",
    {
        id: "progress.assignment.complete",
        priority: 50,
        applies: ({ resource, ctx }) => !!resource && !!ctx,
        execute: ({ user, resource, ctx }) =>
            isAssignmentComplete(user, resource, ctx)
    },
    "all"
);

