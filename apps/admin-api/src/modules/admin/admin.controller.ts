import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectIdInterceptor, RESOURCES, ACTIONS, systemPermissions, ResponseMessage, PaginationDto } from '@libs/index';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post()
  @Permissions(RESOURCES.ADMIN, ACTIONS.CREATE)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @Permissions(RESOURCES.ADMIN, ACTIONS.LIST_VIEW)
  findAll(@Query() pagination: PaginationDto) {
    return this.adminService.findAll({ relations: ['role'], pagination });
  }



  @Get('me')
  getProfile(@Req() req: any) {
    return this.adminService.findOne(req.user.id, false, ['role']);
  }

  @Patch('me')
  @UseInterceptors(InjectIdInterceptor)
  updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.adminService.update(req.user.id, updateProfileDto);
  }

  @Post('me/email/request')
  @ResponseMessage('OTP sent successfully to the new email address.')
  requestEmailChange(@Req() req: any, @Body() dto: RequestEmailChangeDto) {
    return this.adminService.requestEmailChange(req.user.id, dto.newEmail);
  }

  @Patch('me/email/verify')
  @ResponseMessage('Email updated successfully. Please sign in again.')
  verifyEmailChange(@Req() req: any, @Body() dto: VerifyEmailChangeDto) {
    return this.adminService.verifyEmailChange(req.user.id, dto.otp);
  }

  @Patch('me/password')
  @ResponseMessage('Password changed successfully. Please sign in again.')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.adminService.changePassword(req.user.id, dto);
  }

  @Get(':id')
  @Permissions(RESOURCES.ADMIN, ACTIONS.DETAILED_VIEW)
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id, false, ['role']);
  }

  @Patch(':id')
  @Permissions(RESOURCES.ADMIN, ACTIONS.UPDATE)
  @UseInterceptors(InjectIdInterceptor)
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @Permissions(RESOURCES.ADMIN, ACTIONS.DELETE_SOFT)
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  @Delete(':id/hard-delete')
  @Permissions(RESOURCES.ADMIN, ACTIONS.DELETE_HARD)
  removeHard(@Param('id') id: string) {
    return this.adminService.removeHard(+id);
  }

  @Post('restore/:id')
  @Permissions(RESOURCES.ADMIN, ACTIONS.RESTORE)
  restore(@Param('id') id: string) {
    return this.adminService.restore(+id);
  }
}
