import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RESOURCES, systemPermissions } from '@libs/index';

@ValidatorConstraint({ name: 'isRolePermissions', async: false })
export class IsRolePermissionsConstraint implements ValidatorConstraintInterface {
  validate(permissions: any) {
    // Must be a valid object (not null, not array)
    if (typeof permissions !== 'object' || permissions === null || Array.isArray(permissions)) {
      return false;
    }

    const validResources = Object.values(RESOURCES) as string[];

    for (const [resource, actions] of Object.entries(permissions)) {
      // Key must be a valid resource
      if (!validResources.includes(resource)) {
        return false;
      }

      // Value must be an array
      if (!Array.isArray(actions)) {
        return false;
      }

      // Every item in the array must be a valid action
      if (!actions.every((action) => systemPermissions[resource].includes(action))) {
        return false;
      }
    }

    return true;
  }

  defaultMessage() {
    return 'permissions must be a valid object mapping RESOURCES to an array of ACTIONS. Ensure no invalid keys or values are present.';
  }
}

export function IsRolePermissions(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRolePermissionsConstraint,
    });
  };
}
