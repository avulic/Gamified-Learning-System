// src/access/policy-impls/quizImpls.ts

import { ABACResult } from "../registry/PolicyRegistry";


export function canViewQuiz(quiz: any, user: any, ctx: any): ABACResult {
    if (!quiz) return { allowed: false, reason: 'Quiz missing' };
    if (!quiz.isPublished && !user.roles.includes('professor')) return { allowed: false, reason: 'Quiz not published' };
    if (!ctx.enrollment) return { allowed: false, reason: 'Not enrolled' };
    return { allowed: true };
}

export function canStartQuizAttempt(quiz: any, user: any, ctx: any): ABACResult {
    if (!ctx.enrollment) return { allowed: false, reason: 'Not enrolled' };
    const now = ctx.now ?? new Date();
    if (quiz.openAt && now < new Date(quiz.openAt)) return { allowed: false, reason: 'Quiz not open' };
    if (quiz.closeAt && now > new Date(quiz.closeAt)) return { allowed: false, reason: 'Quiz closed' };
    const attempts = ctx.attempts ?? 0;
    if (typeof quiz.maxAttempts === 'number' && attempts >= quiz.maxAttempts) return { allowed: false, reason: 'No attempts remaining' };
    return { allowed: true, meta: { attempts, remaining: (quiz.maxAttempts === Infinity) ? Infinity : Math.max(0, (quiz.maxAttempts ?? Infinity) - attempts) } };
}

export function canSubmitQuizAttempt(attempt: any, user: any): ABACResult {
    if (!attempt) return { allowed: false, reason: 'Attempt missing' };
    if (attempt.userId !== user.id) return { allowed: false, reason: 'Cannot submit another user\'s attempt' };
    if (attempt.status === 'submitted') return { allowed: false, reason: 'Attempt already submitted' };
    return { allowed: true };
}

export function canGradeQuiz(user: any, quiz: any): ABACResult {
    if (user.roles.includes('professor')) return { allowed: true };
    if (user.roles.includes('assistant') && user.attrs?.assignedCourseId === quiz.courseId) return { allowed: true };
    return { allowed: false, reason: 'Not authorized to grade quiz' };
}
