import { el } from '@faker-js/faker/.';
import { evaluateSubmissionTime } from './timePolicies';
import { ProgressType, ProgressTypeEnum } from '@/models/enums';

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

export function canSubmitTask(task: any, user: any, ctx: any) {
    const rules = [
        () => { if (ctx.assignment.userId === user.id) return { allowed: true }; else return { allowed: false, reason: "Cannot submit own assignment" }; },

        // Only enforce ABAC if not bypassed
        () => ruleSubmissionWindow(task, ctx.submissionAt),
        () => rulePrerequisites(task, ctx.assignment, ctx.taskProgress),
        () => ruleGlobalMaxAttempts(task, ctx.taskProgress),
        //() => ruleQuizMaxAttempts(task, ctx.taskProgress),
    ];



    for (const runRule of rules) {
        const result = runRule();

        if (!result.allowed) return result;
    }

    return { allowed: true };
}




// ---------------------------------------------
// Rule 4: Submission window (time-based ABAC)
// ---------------------------------------------
export function ruleSubmissionWindow(task, submissionAt) {
    const window = task.submissionWindow ?? {};
    const { start, end, allowLateSubmissions } = window;

    if (start && submissionAt < new Date(start)) {
        return { allowed: false, reason: "Submission window not open yet" };
    }

    if (end && submissionAt > new Date(end)) {
        if (!allowLateSubmissions) {
            return { allowed: false, reason: "Submission window closed" };
        }
    }

    return { allowed: true };
}

// ---------------------------------------------
// Rule 5: Prerequisites completed (progress-based ABAC)
// ---------------------------------------------
export function rulePrerequisites(task, assignment, taskProgressRows) {
    if (!task.prerequisites?.length) return { allowed: true };

    for (const reqId of task.prerequisites) {
        const prereq = assignment.tasks?.find(t => t.id === reqId);
        if (!prereq) continue;

        const reqProgress = taskProgressRows?.find(
            p => p.taskId.toString() === reqId.toString()
        );

        if (!reqProgress || reqProgress.status !== ProgressTypeEnum.COMPLETED) {
            return {
                allowed: false,
                reason: `Prerequisite task ${reqId} not completed`
            };
        }
    }

    return { allowed: true };
}

// ---------------------------------------------
// Rule 6: Global max attempts (state ABAC)
// ---------------------------------------------
export function ruleGlobalMaxAttempts(task, taskProgressRow) {
    const maxAttempts = task.maxAttempts ?? -1;
    if (maxAttempts <= 0) return { allowed: true };

    const used = taskProgressRow?.attempts ?? 0;

    if (used >= maxAttempts) {
        return {
            allowed: false,
            reason: `Max attempts (${maxAttempts}) reached`
        };
    }

    return { allowed: true };
}

// ---------------------------------------------
// Rule 7: Quiz-specific max attempts
// ---------------------------------------------
export function ruleQuizMaxAttempts(task, taskProgressRow) {
    if (task.taskType !== "QUIZ") return { allowed: true };

    const quizMax = task.content?.maxAttempts ?? -1;
    if (quizMax <= 0) return { allowed: true };

    const used = taskProgressRow?.attempts ?? 0;

    if (used >= quizMax) {
        return {
            allowed: false,
            reason: `Quiz max attempts (${quizMax}) reached`
        };
    }

    return { allowed: true };
}
