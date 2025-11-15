// src/access/AccessService.ts
import { getEnforcer } from './casbin/CasbinEnforcer';
import { ForbiddenError } from '@/models/app/Errors/ForbiddenError';
import { PolicyRegistry, PolicyContext, ABACResult } from './casbin/registry/PolicyRegistry';

export type AccessServiceConfig = {
    auditFn?: (user: any, policyId: string | null, resourceType: string | null, resourceId: string | null, ctx: any, result: ABACResult) => Promise<void> | void;
    getEnforcerFn?: () => Promise<any>;
    combineMode?: 'deny-overrides' | 'allow-overrides'; // future use
};

export class AccessService {
    private static enforcerPromise: Promise<any> | null = null;
    private static config: AccessServiceConfig = { combineMode: 'deny-overrides' };

    static configure(cfg: Partial<AccessServiceConfig>) {
        this.config = { ...this.config, ...cfg };
        if (cfg.getEnforcerFn) {
            this.enforcerPromise = cfg.getEnforcerFn();
        }
    }

    private static async getCachedEnforcer(): Promise<any> {
        if (this.enforcerPromise) return this.enforcerPromise;
        const loader = this.config.getEnforcerFn ?? (() => Promise.resolve(getEnforcer()));
        this.enforcerPromise = Promise.resolve(loader());
        return this.enforcerPromise;
    }

    // RBAC check using casbin enforcer. Throws ForbiddenError on deny if throwOnDeny true.
    static async checkRBAC(userRoles: string[] = [], resource: string, action: string, throwOnDeny = true) {
        if (!Array.isArray(userRoles) || userRoles.length === 0) {
            if (throwOnDeny) throw new ForbiddenError(`RBAC deny for ${resource}.${action}: no roles`);
            return false;
        }

        const enforcer = await this.getCachedEnforcer();
        let lastErr: Error | null = null;
        for (const role of userRoles) {
            try {
                const allowed = await enforcer.enforce(
                    role.toLowerCase(),
                    resource.toLowerCase(),
                    action.toLowerCase());
                if (allowed) return true;
            } catch (err) {
                lastErr = err as Error;
                console.error('Casbin enforce error for role', role, err);
            }
        }

        if (throwOnDeny) {
            const reason = lastErr ? `RBAC error: ${lastErr.message}` : `RBAC deny for ${resource}.${action}`;
            throw new ForbiddenError(reason);
        }
        return false;
    }

    private static async maybeAudit(user: any, policyId: string | null, resourceType: string | null, resourceId: string | null, ctx: any, result: ABACResult) {
        if (!this.config.auditFn) return;
        try {
            await Promise.resolve(this.config.auditFn(user, policyId, resourceType, resourceId, ctx, result));
        } catch (err) {
            console.error('Audit function failed', err);
        }
    }

    /**
     * Runs ABAC policies for the resourceType + action.
     * Action-level combine mode is defined at registration time (all = AND, any = OR).
     */
    static async runABAC(user: any, resource: any, action: string, ctx: any = {}): Promise<ABACResult> {
        ctx.now = ctx.now ?? new Date();
        const resourceType = resource?.type ?? null;
        const bucket = PolicyRegistry.getActionBucket(resourceType ?? '', action);

        if (!bucket) {
            const res: ABACResult = { allowed: false, reason: `No ABAC policies for ${resourceType}.${action}` };
            await this.maybeAudit(user, null, resourceType, resource?.id ?? null, ctx, res);
            return res;
        }

        const policyCtx: PolicyContext = { user, resource, ctx };
        const mode = bucket.mode; // 'all' or 'any'
        let anyAllow = false; // used for 'any' mode
        let anyDeny = false;
        let firstDenyReason: string | undefined;

        for (const policy of bucket.policies) {
            // quick applies check
            let applies = false;
            try {
                applies = Boolean(policy.applies(policyCtx));
            } catch (err) {
                console.error(`Policy ${policy.id} applies() error`, err);
                applies = false;
            }
            if (!applies) {
                continue; // not relevant
            }

            let result: ABACResult = { allowed: false, reason: 'Policy execution error' };
            try {
                result = await Promise.resolve(policy.execute(policyCtx));
            } catch (err) {
                console.error(`Policy ${policy.id} execute() error`, err);
                result = { allowed: false, reason: 'Policy execution error' };
            }

            await this.maybeAudit(user, policy.id, resourceType, resource?.id ?? null, ctx, result);

            if (result.skip) continue;

            if (mode === 'all') {
                // AND semantics: any deny => overall deny
                if (!result.allowed) {
                    return { allowed: false, reason: result.reason, meta: result.meta };
                }
                // allowed -> continue checking others
                continue;
            } else {
                // mode === 'any' (OR semantics)
                if (result.allowed) {
                    // short-circuit allow
                    return { allowed: true, meta: result.meta };
                } else {
                    // keep track of denies
                    anyDeny = true;
                    firstDenyReason ??= result.reason;
                }
            }
        }

        if (mode === 'all') {
            // If we executed all relevant policies and none denied, allow
            return { allowed: true };
        } else {
            // any mode: if at least one policy applied and none allowed -> deny
            if (anyDeny) {
                return { allowed: false, reason: firstDenyReason };
            }
            // no applicable policies -> deny by default
            return { allowed: false, reason: `No applicable ABAC policy allowed ${resourceType}.${action}` };
        }
    }

    /**
     * Top-level authorize: RBAC -> ABAC. Throws ForbiddenError if throwOnDeny and denied.
     */
    static async authorize(user: any,
        resourceType: string,
        action: string,
        resource: any,
        ctx: any = {},
        options: { throwOnDeny?: boolean } = {}): Promise<{ allowed: boolean; reason?: string; meta?: any }> {
        const throwOnDeny = options.throwOnDeny ?? true;

        // 1) RBAC check; resourceType string used as Casbin object
        try {
            await this.checkRBAC(user.roles ?? [], resourceType, action, throwOnDeny);
        } catch (err) {
            if (throwOnDeny) throw err;
            return { allowed: false, reason: (err as Error).message };
        }

        // Add action and resourceType to ctx for policy usage
        ctx.action = action;
        ctx.resourceType = resourceType;

        // 2) ABAC policies for resourceType.action
        const abac = await this.runABAC(user, { ...resource, type: resourceType }, action, ctx);
        if (!abac.allowed) {
            if (throwOnDeny) throw new ForbiddenError(abac.reason ?? 'Access denied (ABAC)');
            return abac;
        }

        return { allowed: true, meta: abac.meta };
    }
}
