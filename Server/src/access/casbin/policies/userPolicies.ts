import { Role } from "@/models/app";
import { ABACResult } from "../registry/PolicyRegistry";
import { Roles } from "@/models/enums";

export function canViewUser(requestingUser: any, targetUser: any): ABACResult {
    // Admins can view anyone
    if (requestingUser.roles?.some(r => r.name === "ADMIN"))
        return { allowed: true };

    // Users can view themselves
    if (requestingUser.id === targetUser.id)
        return { allowed: true };

    return { allowed: false, reason: "Insufficient privileges to view this user" };
}

export function canUpdateUser(requestingUser: any, targetUser: any): ABACResult {
    const isAdmin = requestingUser.roles?.some(r => r === Roles.ADMIN);
    const isSelf = requestingUser.id === targetUser.id;

    if (isAdmin || isSelf) return { allowed: true };

    return { allowed: false, reason: "Only admins or the user themselves can update this user" };
}

export function canChangeUserRoles(requestingUser: any, targetUser: any): ABACResult {
    const isAdmin = requestingUser.roles?.some(r => r.name === "ADMIN");

    if (!isAdmin)
        return { allowed: false, reason: "Only admins can change user roles" };

    // Admins cannot demote other admins unless superadmin exists (optional safety rule)
    const isTargetAdmin = targetUser.roles?.some(r => r.name === "ADMIN");
    if (isTargetAdmin && !requestingUser.roles.some(r => r.name === "SUPERADMIN"))
        return { allowed: false, reason: "Cannot modify another admin's roles" };

    return { allowed: true };
}

export function canDeleteUser(requestingUser: any, targetUser: any): ABACResult {
    // Admin only
    if (!requestingUser.roles?.some(r => r.name === "ADMIN"))
        return { allowed: false, reason: "Only admins can delete users" };

    // Admin cannot delete themselves for safety
    if (requestingUser.id === targetUser.id)
        return { allowed: false, reason: "You cannot delete your own account" };

    return { allowed: true };
}


export function canUpdateSensitiveFields(requestingUser: any, targetUser: any, updatedFields: string[]): ABACResult {
    const sensitive = ["roles", "email", "username"];

    const isAdmin = requestingUser.roles?.some(r => r.name === "ADMIN");
    const isSelf = requestingUser.id === targetUser.id;

    const attemptingSensitive = updatedFields.some(f => sensitive.includes(f));

    if (!attemptingSensitive) return { allowed: true };

    if (isAdmin) return { allowed: true };
    if (isSelf && !updatedFields.includes("roles"))
        return { allowed: true };

    return { allowed: false, reason: "Sensitive fields require admin privileges" };
}

export function canUpdatePreferences(requestingUser: any, targetUser: any): ABACResult {
    if (requestingUser.id === targetUser.id) return { allowed: true };

    return { allowed: false, reason: "Only the user can modify their preferences" };
}
