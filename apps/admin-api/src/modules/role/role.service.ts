import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, Admin, RedisService, REDIS_KEYS, parseDurationToMs, BaseService } from '@libs/index';
import { AppConfig } from '@libs/config/app.config';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private readonly redisService: RedisService
  ) {
    super(roleRepo);
  }

  async findAll(options?: any) {
    return super.findAll({
      ...options,
      searchableFields: ['name'],
    });
  }

  private async invalidateRole(id: number) {
    const ttlMs = parseDurationToMs(AppConfig.JWT_EXPIRES_IN as string);
    // Save current timestamp to Redis so older JWTs are blocked
    await this.redisService.set(`${REDIS_KEYS.ROLE_INVALIDATED}:${id}`, Date.now().toString(), ttlMs);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    // Fetch existing role so we can compare permissions before and after
    const existing = await this.findOne(id);

    const role = await super.update(id, updateRoleDto);

    // Only invalidate cached JWTs when permissions actually changed
    if (
      updateRoleDto.permissions !== undefined &&
      JSON.stringify(existing.permissions) !== JSON.stringify(updateRoleDto.permissions)
    ) {
      await this.invalidateRole(id);
    }
    return role;
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    if (role.isSuperAdmin) {
      throw new BadRequestException('Cannot delete a system super admin role');
    }

    // Check if role is used by any admins
    const adminsWithRole = await this.adminRepo.count({ where: { roleId: id } });
    if (adminsWithRole > 0) {
      throw new BadRequestException('Cannot delete role as it is assigned to one or more admins');
    }

    const result = await super.remove(id);
    await this.invalidateRole(id);
    return result;
  }

  async removeHard(id: number) {
    const role = await this.findOne(id);
    if (role.isSuperAdmin) {
      throw new BadRequestException('Cannot delete a system super admin role');
    }

    const result = await super.removeHard(id);
    await this.invalidateRole(id);
    return result;
  }

  async restore(id: number) {
    const result = await super.restore(id);
    await this.invalidateRole(id);
    return result;
  }
}
