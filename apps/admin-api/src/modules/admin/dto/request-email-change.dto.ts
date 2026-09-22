import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsUnique } from '@libs/index';

export class RequestEmailChangeDto {
    @IsEmail()
    @IsNotEmpty()
    @IsUnique({ tableName: 'admins', column: 'email' })
    newEmail!: string;
}
