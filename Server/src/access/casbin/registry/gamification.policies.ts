import { canAccessLevel, canRedeemReward, canEarnXP, canClaimBadge } from "../policies/gamificationPolicies";
import { PolicyRegistry } from "./PolicyRegistry";

/**
 * Level access
 */
PolicyRegistry.register('level', 'access', {
    id: 'level.access',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'level' && ctx.action === 'access',
    execute: ({ user, resource }) =>
        canAccessLevel(user, resource.requiredLevel)
}, 'all');

/**
 * Redeem a reward
 */
PolicyRegistry.register('reward', 'redeem', {
    id: 'reward.redeem',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'reward' && ctx.action === 'redeem',
    execute: ({ user, resource }) =>
        canRedeemReward(user, resource)
}, 'all');

/**
 * Earn XP
 */
PolicyRegistry.register('activity', 'earn-xp', {
    id: 'activity.earnXp',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'activity' && ctx.action === 'earn-xp',
    execute: ({ user, resource }) =>
        canEarnXP(user, resource)
}, 'all');

/**
 * Claim a badge reward
 */
PolicyRegistry.register('reward', 'claim-badge', {
    id: 'reward.claimBadge',
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === 'reward' && ctx.action === 'claim-badge',
    execute: ({ user, resource }) =>
        canClaimBadge(user, resource)
}, 'all');
