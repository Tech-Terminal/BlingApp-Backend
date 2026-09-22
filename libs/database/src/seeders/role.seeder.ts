import { DataSource } from 'typeorm';
import { Role, superAdminPermissions } from '@libs/index';

export const seedRoles = async (dataSource: DataSource): Promise<Role> => {
    console.log('🛡️  Seeding Super Admin Role...');
    const roleRepo = dataSource.getRepository(Role);
    
    let superAdminRole = await roleRepo.findOne({ where: { name: 'Super Admin' } });
    if (!superAdminRole) {
        superAdminRole = roleRepo.create({
            name: 'Super Admin',
            permissions: superAdminPermissions,
            isSuperAdmin: true,
        });
        superAdminRole = await roleRepo.save(superAdminRole);
    } else {
        superAdminRole.permissions = superAdminPermissions;
        superAdminRole.isSuperAdmin = true;
        superAdminRole = await roleRepo.save(superAdminRole);
    }
    
    return superAdminRole;
};
