// src/access/policies/quiz.policies.ts

import { canViewQuiz, canStartQuizAttempt, canSubmitQuizAttempt, canGradeQuiz } from "../policies/quizPolicies";
import { PolicyRegistry } from "./PolicyRegistry";

PolicyRegistry.register('quiz', 'view', {
    id: 'quiz.view',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'quiz' && ctx.action === 'view',
    execute: ({ user, resource, ctx }) => canViewQuiz(resource, user, ctx)
}, 'all');

PolicyRegistry.register('quiz', 'start-attempt', {
    id: 'quiz.start-attempt',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'quiz' && ctx.action === 'start-attempt',
    execute: ({ user, resource, ctx }) => canStartQuizAttempt(resource, user, ctx)
}, 'all');

PolicyRegistry.register('quiz', 'submit-attempt', {
    id: 'quiz.submit-attempt',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'quiz-attempt' && ctx.action === 'submit-attempt',
    execute: ({ user, resource }) => canSubmitQuizAttempt(resource, user)
}, 'all');

PolicyRegistry.register('quiz', 'grade', {
    id: 'quiz.grade',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'quiz' && ctx.action === 'grade',
    execute: ({ user, resource }) => canGradeQuiz(user, resource)
}, 'all');
