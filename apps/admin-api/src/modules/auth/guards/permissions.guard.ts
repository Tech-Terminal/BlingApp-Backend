import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { ACTIONS, RESOURCES } from '@libs/index';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get the required permission object from the decorator metadata
    const requiredPermission = this.reflector.getAllAndOverride<{ resource: RESOURCES, action: ACTIONS }>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Can decorator is placed, open access by default
    if (!requiredPermission) {
      return true;
    }

    // 2. Extract the authenticated admin from the request context
    const request = context.switchToHttp().getRequest();
    const admin = request.user; // Set by your prior AuthMiddleware

    if (!admin || !admin.role) {
      throw new ForbiddenException('Authentication and an assigned role are required to access this resource.');
    }

    if (admin.role.isSuperAdmin) {
      return true;
    }

    // 3. Verify permissions based on the RolePermissions Partial<Record<RESOURCES, ACTIONS[]>> structure
    const rolePermissions = admin.role.permissions || {};
    const resourceActions = rolePermissions[requiredPermission.resource];

    const hasPermission = resourceActions && resourceActions.includes(requiredPermission.action);

    if (!hasPermission) {
      throw new ForbiddenException(`You do not have the required permission: ${requiredPermission.action} on ${requiredPermission.resource}`);
    }

    return true;
  }
}