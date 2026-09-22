import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
const request = require('supertest');
import { AdminAppModule } from '../apps/admin-api/src/admin-app.module';
import { DataSource } from 'typeorm';
import { RedisService, Admin, Role, Setting } from '@libs/index';
import { generateAndHashPassword } from '../apps/admin-api/src/modules/admin/utils/password-generator.util';

describe('SettingsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let redisService: RedisService;
  let adminRepo: any;
  let roleRepo: any;
  let settingRepo: any;

  let validToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminAppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    useContainer(app.select(AdminAppModule), { fallbackOnErrors: true });
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    dataSource = app.get(DataSource);
    redisService = app.get(RedisService);
    adminRepo = dataSource.getRepository(Admin);
    roleRepo = dataSource.getRepository(Role);
    settingRepo = dataSource.getRepository(Setting);

    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await redisService.flushall();

    // Seed Super Admin Role
    const superAdminRole = roleRepo.create({
      name: 'Super Admin',
      permissions: {
        setting: ['list_view', 'update'],
      } as any,
    });
    const savedRole = await roleRepo.save(superAdminRole);

    // Seed Super Admin User
    const plainTextPassword = 'SuperPassword123!';
    const testAdmin = adminRepo.create({
      name: 'Super Admin',
      email: 'super@admin.com',
      password: await generateAndHashPassword(12).then(() => 'placeholder'),
      phone: '+1000000000',
      isActive: true,
      roleId: savedRole.id,
    });
    const { hashPassword } = require('@libs/index');
    testAdmin.password = await hashPassword(plainTextPassword);
    await adminRepo.save(testAdmin);

    // Seed Settings
    const defaultSettings = [
      { key: 'facebook_url', value: 'https://facebook.com/bling', type: 'string' },
    ];
    await settingRepo.save(defaultSettings);

    // Authenticate
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'super@admin.com', password: plainTextPassword });
    
    validToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('/settings (GET)', () => {
    it('should list all settings', () => {
      return request(app.getHttpServer())
        .get('/api/settings')
        .set('Authorization', `Bearer ${validToken}`)
        .then((res: any) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          const fbSetting = res.body.find((s: any) => s.key === 'facebook_url');
          expect(fbSetting).toBeDefined();
          expect(fbSetting.value).toBe('https://facebook.com/bling');
        });
    });
  });

  describe('/settings (PATCH)', () => {
    it('should bulk update settings', () => {
      return request(app.getHttpServer())
        .patch('/api/settings')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          settings: [
            { key: 'facebook_url', value: 'https://facebook.com/bling_updated' }
          ]
        })
        .then((res: any) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          const fbSetting = res.body.find((s: any) => s.key === 'facebook_url');
          expect(fbSetting).toBeDefined();
          expect(fbSetting.value).toBe('https://facebook.com/bling_updated');
        });
    });
  });
});
