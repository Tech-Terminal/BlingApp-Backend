import { SetMetadata } from "@nestjs/common";
import { ACTIONS, RESOURCES } from "@libs/index";

export const PERMISSION_KEY = 'permission';

// Store an object containing both the resource and the action
export const Permissions = (resource: RESOURCES, action: ACTIONS) => SetMetadata(PERMISSION_KEY, { resource, action }); 