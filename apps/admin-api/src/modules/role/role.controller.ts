import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectIdInterceptor, RESOURCES, ACTIONS, PaginationDto, systemPermissions } from '@libs/index';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions(RESOURCES.ROLE, ACTIONS.CREATE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Permissions(RESOURCES.ROLE, ACTIONS.LIST_VIEW)
  findAll(@Query() pagination: PaginationDto) {
    return this.roleService.findAll({ pagination });
  }
  @Get('permissions')
  getPermissions() {
    return systemPermissions;
  }

  @Get(':id')
  @Permissions(RESOURCES.ROLE, ACTIONS.DETAILED_VIEW)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(RESOURCES.ROLE, ACTIONS.UPDATE)
  @UseInterceptors(InjectIdInterceptor)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions(RESOURCES.ROLE, ACTIONS.DELETE_SOFT)
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Delete(':id/hard-delete')
  @Permissions(RESOURCES.ROLE, ACTIONS.DELETE_HARD)
  removeHard(@Param('id') id: string) {
    return this.roleService.removeHard(+id);
  }

  @Post('restore/:id')
  @Permissions(RESOURCES.ROLE, ACTIONS.RESTORE)
  restore(@Param('id') id: string) {
    return this.roleService.restore(+id);
  }
}
