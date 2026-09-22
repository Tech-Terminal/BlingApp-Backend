import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type IsUniqueConstraintInput = {
  tableName: string;
  column: string;
  excludeField?: string;
};

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const { tableName, column } = args.constraints[0] as IsUniqueConstraintInput;
    
    // Check if there is an 'id' property on the DTO payload (injected by our interceptor for updates)
    const id = (args.object as any).id;

    let query = `SELECT EXISTS (SELECT 1 FROM "${tableName}" WHERE "${column}" = $1`;
    const parameters: any[] = [value];
    let paramIndex = 2;

    if (id) {
      const excludeField = (args.constraints[0] as IsUniqueConstraintInput).excludeField || 'id';
      query += ` AND "${excludeField}" != $${paramIndex}`;
      parameters.push(id);
      paramIndex++;
    }

    // Automatically handle soft deletes if the table supports it
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (metadata && metadata.deleteDateColumn) {
      query += ` AND "${metadata.deleteDateColumn.databaseName}" IS NULL`;
    }

    query += ')';

    const result = await this.dataSource.query(query, parameters);
    
    // EXISTS returns true if a duplicate is found. We want to return true only if NO duplicate is found.
    return !result[0].exists; 
  }

  defaultMessage(args: ValidationArguments) {
    const { column } = args.constraints[0] as IsUniqueConstraintInput;
    return `${column} already exists`;
  }
}

export function IsUnique(
  options: IsUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}
