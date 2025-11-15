// src/access/policies/profile.policies.ts

import { canViewProfile, canEditProfile } from "../policies/profilePolicies";
import { PolicyRegistry } from "./PolicyRegistry";

PolicyRegistry.register('profile', 'view', {
    id: 'profile.view',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'profile' && ctx.action === 'view',
    execute: ({ user, resource }) => canViewProfile(resource, user)
}, 'all');

PolicyRegistry.register('profile', 'edit', {
    id: 'profile.edit',
    priority: 200,
    applies: ({ resource, ctx }) => resource?.type === 'profile' && ctx.action === 'edit',
    execute: ({ user, resource }) => canEditProfile(resource, user)
}, 'all');
