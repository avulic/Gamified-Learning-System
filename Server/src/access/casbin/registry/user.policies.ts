import { canViewUser, canUpdateUser, canChangeUserRoles, canUpdateSensitiveFields, canUpdatePreferences, canDeleteUser } from "../policies/userPolicies";
import { PolicyRegistry } from "./PolicyRegistry";

// -----------------------------------------------------------
// VIEW USER
// -----------------------------------------------------------
PolicyRegistry.register("user", "view", {
    id: "user.view",
    priority: 100,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" && ctx.action === "view",
    execute: ({ user, resource }) =>
        canViewUser(user, resource)
}, "all");

// -----------------------------------------------------------
// UPDATE USER
// -----------------------------------------------------------
PolicyRegistry.register("user", "update", {
    id: "user.update",
    priority: 100,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" && ctx.action === "update",
    execute: ({ user, resource }) =>
        canUpdateUser(user, resource)
}, "all");

// -----------------------------------------------------------
// CHANGE ROLES
// -----------------------------------------------------------
PolicyRegistry.register("user", "change-roles", {
    id: "user.changeRoles",
    priority: 200,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" && ctx.action === "change-roles",
    execute: ({ user, resource }) =>
        canChangeUserRoles(user, resource)
}, "all");

// -----------------------------------------------------------
// UPDATE SENSITIVE FIELDS (email, username, roles)
// -----------------------------------------------------------
PolicyRegistry.register("user", "update-sensitive", {
    id: "user.updateSensitive",
    priority: 300,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" &&
        ctx.action === "update" &&
        Array.isArray(ctx.updatedFields),

    execute: ({ user, resource, ctx }) =>
        canUpdateSensitiveFields(user, resource, ctx.updatedFields)
}, "all");

// -----------------------------------------------------------
// UPDATE PREFERENCES
// -----------------------------------------------------------
PolicyRegistry.register("user", "update-preferences", {
    id: "user.updatePreferences",
    priority: 100,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" &&
        ctx.action === "update-preferences",
    execute: ({ user, resource }) =>
        canUpdatePreferences(user, resource)
}, "all");

// -----------------------------------------------------------
// DELETE USER
// -----------------------------------------------------------
PolicyRegistry.register("user", "delete", {
    id: "user.delete",
    priority: 100,
    applies: ({ resource, ctx }) =>
        resource?.type === "user" && ctx.action === "delete",
    execute: ({ user, resource }) =>
        canDeleteUser(user, resource)
}, "all");
