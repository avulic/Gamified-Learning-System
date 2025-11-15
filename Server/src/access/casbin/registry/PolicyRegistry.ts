// src/access/policies/PolicyRegistry.ts
// src/access/policies/types.ts
// src/access/policies/types.ts

// src/access/policy/types.ts
export type ABACResult = {
    allowed: boolean;
    reason?: string;
    meta?: any;
    /** If true the policy says "I am not applicable right now" */
    skip?: boolean;
};

export type PolicyContext = {
    user: any;
    resource: any;
    ctx: any;
};

export type ExecuteFn = (ctx: PolicyContext) => Promise<ABACResult> | ABACResult;
export type AppliesFn = (ctx: PolicyContext) => boolean;

export type ABACPolicy = {
    id: string;
    description?: string;
    priority?: number; // higher executes first within the action
    applies: AppliesFn;
    execute: ExecuteFn;
};


// src/access/policies/PolicyRegistry.ts


type ActionMode = 'all' | 'any';

type ActionBucket = {
    mode: ActionMode;
    policies: ABACPolicy[];
};

type ResourceRegistry = {
    [action: string]: ActionBucket;
};

export class PolicyRegistry {
    // map: resourceType -> action -> { mode, policies[] }
    private static registry: Record<string, ResourceRegistry> = {};

    /**
     * Register a policy under a specific resource type and action.
     * @param resourceType e.g. 'assignment'
     * @param action e.g. 'submit' or 'view'
     * @param policy the ABAC policy
     * @param mode combining mode for the action ('all' | 'any'). If the action already exists, mode must match or will be ignored.
     */
    static register(resourceType: string, action: string, policy: ABACPolicy, mode: ActionMode = 'all') {
        PolicyRegistry.registry[resourceType] ??= {};
        if (!PolicyRegistry.registry[resourceType][action]) {
            PolicyRegistry.registry[resourceType][action] = { mode, policies: [] };
        }

        // Prevent duplicate id
        const bucket = PolicyRegistry.registry[resourceType][action];
        if (bucket.policies.some(p => p.id === policy.id)) {
            console.warn(`PolicyRegistry: duplicate policy id "${policy.id}" for ${resourceType}.${action} ignored.`);
            return;
        }

        bucket.policies.push(policy);
        // sort by priority desc
        bucket.policies.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    static getActionBucket(resourceType: string, action: string) {
        return PolicyRegistry.registry[resourceType]?.[action] ?? null;
    }

    static list() {
        return PolicyRegistry.registry;
    }

    static reset() {
        PolicyRegistry.registry = {};
    }

    /** For debugging: get policy ids for resource.action */
    static listPolicyIds(resourceType: string, action: string): string[] {
        const b = PolicyRegistry.getActionBucket(resourceType, action);
        return b ? b.policies.map(p => p.id) : [];
    }
}
