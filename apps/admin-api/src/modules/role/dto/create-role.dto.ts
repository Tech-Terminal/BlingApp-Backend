import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { RolePermissions, IsUnique } from "@libs/index";
import { IsRolePermissions } from "../validators/is-role-permissions.validator";

export class CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    @IsUnique({ tableName: 'roles', column: 'name' })
    name!: string

    @IsNotEmpty()
    @IsRolePermissions()
    permissions!: RolePermissions

}
