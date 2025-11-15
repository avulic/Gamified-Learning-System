import { ABACResult } from "../registry/PolicyRegistry";

// src/access/policy-impls/profileImpls.ts
export function canViewProfile(profile: any, user: any): ABACResult {
    if (!profile) return { allowed: false, reason: 'Profile missing' };
    if (profile.id === user.id) return { allowed: true };
    if (user.roles.includes('admin') || user.roles.includes('professor')) return { allowed: true };
    if (profile.visibility === 'public') return { allowed: true };
    return { allowed: false, reason: 'Profile is private' };
}

export function canEditProfile(profile: any, user: any): ABACResult {
    if (!profile) return { allowed: false, reason: 'Profile missing' };
    if (profile.id === user.id) return { allowed: true };
    if (user.roles.includes('admin')) return { allowed: true };
    return { allowed: false, reason: 'Only owner or admin can edit profile' };
}
