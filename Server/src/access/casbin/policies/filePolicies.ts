// src/access/policy-impls/fileImpls.ts

import { ABACResult } from "../registry/PolicyRegistry";


export function canDownloadFile(file: any, user: any): ABACResult {
    if (!file) return { allowed: false, reason: 'File missing' };
    if (file.ownerId === user.id) return { allowed: true };
    if (user.roles.includes('professor') || user.roles.includes('assistant')) return { allowed: true };
    if (file.visibility === 'public') return { allowed: true };
    return { allowed: false, reason: 'Private file' };
}

export function canUploadFile(user: any, ctx: any): ABACResult {
    if (user.roles.includes('professor') || user.roles.includes('assistant')) return { allowed: true };
    if (ctx?.uploadContext === 'submission') return { allowed: true };
    return { allowed: false, reason: 'Not allowed to upload here' };
}

export function canDeleteFile(file: any, user: any): ABACResult {
    if (!file) return { allowed: false, reason: 'File missing' };
    if (user.roles.includes('admin')) return { allowed: true };
    if (file.ownerId === user.id) return { allowed: true };
    if (user.roles.includes('professor') && file.courseId && file.courseOwnerId === user.id) return { allowed: true };
    return { allowed: false, reason: 'Not authorized to delete this file' };
}
