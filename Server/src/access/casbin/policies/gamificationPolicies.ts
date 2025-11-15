import { ABACResult } from "../registry/PolicyRegistry";

export function canAccessLevel(user: any, requiredLevel: number): ABACResult {
    if ((user.attrs?.game_level ?? 0) >= requiredLevel)
        return { allowed: true };
    return { allowed: false, reason: `Requires level ${requiredLevel}` };
}

export function canRedeemReward(user: any, reward: any): ABACResult {
    if (user.attrs.points < reward.cost)
        return { allowed: false, reason: 'Not enough points' };

    if (reward.availableUntil && new Date() > new Date(reward.availableUntil))
        return { allowed: false, reason: 'Reward expired' };

    return { allowed: true };
}

export function canEarnXP(user: any, activity: any): ABACResult {
    if (!activity) return { allowed: false, reason: 'Invalid activity' };
    if (activity.xpReward <= 0) return { allowed: false, reason: 'No XP for this activity' };
    if (user.attrs?.xpBlocked) return { allowed: false, reason: 'XP earning blocked' };

    return { allowed: true, meta: { xp: activity.xpReward } };
}

export function canClaimBadge(user: any, reward: any): ABACResult {
    if (reward.type !== 'badge')
        return { allowed: false, reason: 'Not a badge reward' };

    const missingPrereq = reward.prerequisites?.find(p => !user.badges?.includes(p));
    if (missingPrereq)
        return { allowed: false, reason: `Missing prerequisite badge: ${missingPrereq}` };

    return { allowed: true };
}
