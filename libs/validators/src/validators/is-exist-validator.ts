import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type IsExistConstraintInput = {
  tableName: string;
  column: string;
};

@ValidatorConstraint({ name: 'isExist', async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const { tableName, column } = args.constraints[0] as IsExistConstraintInput;
    
    let query = `SELECT EXISTS (SELECT 1 FROM "${tableName}" WHERE "${column}" = $1`;
    const parameters: any[] = [value];

    // Automatically handle soft deletes if the table supports it
    const metadata = this.dataSource.entityMetadatas.find(m => m.tableName === tableName);
    if (metadata && metadata.deleteDateColumn) {
      query += ` AND "${metadata.deleteDateColumn.databaseName}" IS NULL`;
    }

    query += ')';

    const result = await this.dataSource.query(query, parameters);
    
    // EXISTS returns true if a record is found.
    return result[0].exists; 
  }

  defaultMessage(args: ValidationArguments) {
    const { tableName, column } = args.constraints[0] as IsExistConstraintInput;
    return `This ${column} doesn't exist in ${tableName}`;
  }
}

export function IsExist(
  options: IsExistConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsExistConstraint,
    });
  };
}
