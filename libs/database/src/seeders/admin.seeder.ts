import { DataSource } from 'typeorm';
import { Admin, Role, hashPassword } from '@libs/index';

export const seedAdmin = async (dataSource: DataSource, superAdminRole: Role): Promise<Admin> => {
    console.log('👤 Seeding Default Admin User...');
    const adminRepo = dataSource.getRepository(Admin);

    let defaultAdmin = await adminRepo.findOne({ where: { email: 'ahmad.gamal.sw@gmail.com' } });
    if (!defaultAdmin) {
        const adminPassword = await hashPassword('123456789/Aa');
        defaultAdmin = adminRepo.create({
            name: 'أحمد جمال محمد',
            email: 'ahmad.gamal.sw@gmail.com',
            password: adminPassword,
            role: superAdminRole,
            isActive: true,
        });
        defaultAdmin = await adminRepo.save(defaultAdmin);
    } else {
        defaultAdmin.role = superAdminRole;
        defaultAdmin = await adminRepo.save(defaultAdmin);
    }

    return defaultAdmin;
};
