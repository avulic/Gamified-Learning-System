// src/access/policies/progressPolicies.ts
import { ABACResult } from "../registry/PolicyRegistry";
import { SubmissionPolicy } from "@/models/enums";

/**
 * Deny-by-default helpers
 */
function deny(reason = "denied"): ABACResult {
    return { allowed: false, reason };
}

function allow(meta?: AbacAllowMeta): ABACResult {
    return { allowed: true, meta };
}

/**
 * PROGRESS.START
 *
 * NOTE: policy MUST NOT mutate data. Must validate context and return allow/deny.
 */
export function canStartProgress(user: any, assignment: any, ctx: ProgressStartCtx): ABACResult {
    if (!assignment) return deny("assignment missing");
    if (ctx.existingProgress) return deny("progress exists");
    if (assignment.isPublished === false) return deny("assignment not published");

    if (!ctx.enrollment || !ctx.enrollment.active) return deny("user not enrolled");

    if (assignment.startDate && ctx.now < new Date(assignment.startDate)) return deny("not started yet");
    if (assignment.endDate && ctx.now > new Date(assignment.endDate)) return deny("assignment closed");

    return allow();
}

/**
 * SUBMISSION.SUBMIT (pre-check)
 *
 * Validate request-level constraints; do NOT calculate business state (scores etc).
 * Return meta that describes what the caller is allowed to do (e.g., whether to attach score).
 */
export function canSubmit(user: any, task: any, ctx: SubmissionSubmitCtx): ABACResult {
    if (!ctx.assignment) return deny("assignment missing in context");
    if (!Array.isArray(ctx.submissionHistory)) return deny("submissionHistory missing or invalid");

    // Example: require assignment published and enrollment active
    //if (ctx.assignment.isPublished === false) return deny("assignment not published");
    if (ctx.enrollment && !ctx.enrollment.active) return deny("user not enrolled");

    // Attempt limit check using submissionHistory shape (array of submissions)
    const assignment = ctx.assignment;
    const maxAttempts = (task?.maxAttempts ?? assignment?.maxAttempts) ?? 1;
    const userAttempts = ctx.submissionHistory.filter((s: any) => s.userId === user.id && s.assignmentId === assignment.id).length;

    if (ctx.attemptNumber !== undefined && ctx.attemptNumber > maxAttempts) {
        return deny(`attempt ${ctx.attemptNumber} exceeds maxAttempts ${maxAttempts}`);
    }
    if (userAttempts >= maxAttempts) return deny(`maximum attempts (${maxAttempts}) reached`);

    // Allowed — return meta of what service may do next (service still applies domain rules)
    return allow({
        allowAttemptIncrease: true,
        allowScoreUpdate: true
    });
}

/**
 * PROGRESS.TASK.UPDATE — authorize a specific task update
 *
 * Policy should return allowed + meta describing which fields/changes are permitted.
 * It MUST NOT compute new "bestScore" or mutate objects.
 */
export function canUpdateTask(user: any, resource: any, ctx: TaskUpdateCtx): ABACResult {
    if (!ctx.progress) return deny("progress missing");
    if (!Array.isArray(ctx.submissionHistory)) return deny("submissionHistory missing");
    if (!ctx.submission) return deny("submission missing");

    const task = resource.task;
    const assignment = ctx.assignment;

    // compute attempt constraints from submissionHistory (safe, read-only)
    const maxAttempts = (task?.maxAttempts ?? assignment?.maxAttempts) ?? 1;
    const userAttempts = ctx.submissionHistory.filter((s: any) => s.userId === user.id && s.assignmentId === assignment.id && s.taskId === ctx.submission.taskId).length;

    // If this submission would push attempts over the limit -> deny
    const wouldBeAttempt = (ctx.prevRow?.attempts || 0) + 1;
    if (wouldBeAttempt > maxAttempts) return deny(`would exceed maxAttempts ${maxAttempts}`);

    // Allowed — meta communicates allowed operations; the service will compute newRow
    return allow({
        allowAttemptIncrease: true,
        allowScoreUpdate: true,
        allowStatusChange: true,
        allowedStatusTransitions: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
    });
}

/**
 * PROGRESS.METRICS.COMPUTE
 */
export function computeProgressMetrics(user: any, assignment: any, ctx: MetricsComputeCtx): ABACResult {
    if (!ctx.progress) return deny("progress missing");
    // safe to compute metrics — policy allows service to run computation
    return allow();
}

/**
 * PROGRESS.ASSIGNMENT.COMPLETE
 *
 * Pure boolean check: only returns allowed true if progress satisfies assignment completion requirements.
 */
export function isAssignmentComplete(user: any, assignment: any, ctx: any): ABACResult {
    const progress = ctx.progress;
    if (!progress) return deny("progress missing");

    const requiredTasks = (assignment.tasks || []).filter((t: any) => t.requiredForCompletion);
    const requiredIds = requiredTasks.length > 0 ? requiredTasks.map((t: any) => t.id) : (assignment.tasks || []).map((t: any) => t.id);

    for (const rid of requiredIds) {
        const row = progress.tasksProgress.find((p: any) => p.taskId?.toString() === rid?.toString());
        if (!row || row.status !== "COMPLETED") return deny("required tasks incomplete");
    }
    return allow();
}





// src/access/abacContexts.ts
import { Assignment, Task, User } from '@/models/app';
import { AssignmentProgress, TaskSubmissionStatus } from '@/models/app/Progress/AssignmentProgress.entity';
import { BaseTaskSubmission } from '@/models/app/Submission.entity';

/**
 * Contract: progress-start
 */
export interface ProgressStartCtx {
    now: Date;
    existingProgress?: AssignmentProgress | null;
    enrollment?: any; // fill with your Enrollment type
}

/**
 * Contract: submission.submit (single submission pre-check)
 */
export interface SubmissionSubmitCtx {
    progress?: AssignmentProgress;
    assignment: Assignment;
    submittedAt: Date;
    submissionHistory: BaseTaskSubmission[]; // array of prior submissions
    attemptNumber?: number; // the attempt number *this* submission would be
    enrollment?: any;
    userRoles?: string[]; // optional
}

/**
 * Contract: progress.task.update (per-task update)
 */
export interface TaskUpdateCtx {
    now: Date;
    progress: AssignmentProgress;
    assignment: Assignment;
    prevRow?: TaskSubmissionStatus;
    submission: BaseTaskSubmission;
    submissionHistory: BaseTaskSubmission[]; // array of prior submissions
    enrollment?: any;
}

/**
 * Contract: progress.metrics.compute
 */
export interface MetricsComputeCtx {
    progress: AssignmentProgress;
    assignment: Assignment;
}

/**
 * Generic ABAC result meta for allowed operations
 */
export interface AbacAllowMeta {
    // minimal: whether score update allowed, whether status changes allowed, which fields allowed
    allowScoreUpdate?: boolean;
    allowAttemptIncrease?: boolean;
    allowStatusChange?: boolean;
    allowedStatusTransitions?: string[]; // e.g. ["IN_PROGRESS","COMPLETED"]
    // caller-specific opaque data
    [k: string]: any;
}
