import { DataSource } from 'typeorm';
import { Setting, SETTING_KEYS } from '@libs/index';

export const seedSettings = async (dataSource: DataSource): Promise<Setting[]> => {
    console.log('⚙️  Seeding Default Settings...');
    const settingRepo = dataSource.getRepository(Setting);
    
    const result: Setting[] = [];
    for (const key of Object.values(SETTING_KEYS)) {
        const existing = await settingRepo.findOne({ where: { key: key as SETTING_KEYS } });
        if (!existing) {
            const setting = settingRepo.create({ key: key as SETTING_KEYS, value: '' });
            result.push(await settingRepo.save(setting));
        }
    }
    
    return result;
};
