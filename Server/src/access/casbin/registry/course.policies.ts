// src/access/policies/course.policies.ts

import { canViewCourse, canEditCourse, canJoinCourse, canLeaveCourse } from "../policies/coursePolicies";
import { PolicyRegistry } from "./PolicyRegistry";


// view (AND semantics)
PolicyRegistry.register('course', 'view', {
    id: 'course.view.basic',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'course' && ctx.action === 'view',
    execute: ({ user, resource, ctx }) => canViewCourse(resource, user, ctx)
}, 'all');

// edit
PolicyRegistry.register('course', 'edit', {
    id: 'course.edit.ownerOrAdmin',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'course' && ctx.action === 'edit',
    execute: ({ user, resource }) => canEditCourse(resource, user)
}, 'all');

// join
PolicyRegistry.register('course', 'join', {
    id: 'course.join.policy',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'course' && ctx.action === 'join',
    execute: ({ user, resource }) => canJoinCourse(resource, user)
}, 'all');

// leave
PolicyRegistry.register('course', 'leave', {
    id: 'course.leave.policy',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'course' && ctx.action === 'leave',
    execute: ({ user, resource, ctx }) => canLeaveCourse(resource, user, ctx)
}, 'all');
