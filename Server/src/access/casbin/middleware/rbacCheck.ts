//OPTIONAL, helper for route-level check


import { Request, Response, NextFunction } from 'express';
import { getEnforcer } from '@/access/casbin/CasbinEnforcer';
import { ForbiddenError } from '@/models/app/Errors/ForbiddenError';
import { CustomRequest } from "@/middlewares/authJwt";

// RBAC middleware for coarse-grained permissions
export function rbacCheck(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenPayload = (req as CustomRequest).token?.payload;
      if (!tokenPayload || !tokenPayload.role) return next(new ForbiddenError('Missing role'));

      const role = tokenPayload.role;
      const enforcer = getEnforcer();
      const allowed = await enforcer.enforce(role, resource, action);

      if (!allowed) return next(new ForbiddenError('RBAC: Access denied'));
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
