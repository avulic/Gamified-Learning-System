// src/access/casbin/CasbinEnforcer.ts
import path from 'path';
import { newEnforcer, Enforcer } from 'casbin';

let enforcer: Enforcer | null = null;

export async function initEnforcer(): Promise<Enforcer> {
    if (enforcer) return enforcer;
    const modelPath = path.resolve(__dirname, 'casbin.conf');
    const policyPath = path.resolve(__dirname, 'policy.csv');
    enforcer = await newEnforcer(modelPath, policyPath);
    await enforcer.loadPolicy();
    return enforcer;
}

export function getEnforcer(): Enforcer {
    if (!enforcer) throw new Error('Casbin enforcer not initialized. Call initEnforcer() first.');
    return enforcer;
}

//DB-backed policies later, switch to an adapter (e.g., casbin-mongoose-adapter).