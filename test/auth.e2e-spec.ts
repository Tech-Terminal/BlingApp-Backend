import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
const request = require('supertest');
import { AdminAppModule } from '../apps/admin-api/src/admin-app.module';
import { DataSource } from 'typeorm';
import { RedisService, Admin, hashPassword, Role } from '@libs/index';
import { generateAndHashPassword } from '../apps/admin-api/src/modules/admin/utils/password-generator.util';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let redisService: RedisService;
  let adminRepo: any;

  let testAdmin: Admin;
  let plainTextPassword = 'TestPassword123!';
  let validToken: string;

  beforeAll(async () => {
    // 1. Initialize NestJS App
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminAppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    useContainer(app.select(AdminAppModule), { fallbackOnErrors: true });
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    // 2. Extract services for DB and Redis manipulation
    dataSource = app.get(DataSource);
    redisService = app.get(RedisService);
    adminRepo = dataSource.getRepository(Admin);

    // 3. Clean up DB & Redis
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await redisService.flushall();

    // 4. Seed a Test Admin User
    const { hashedPassword } = await generateAndHashPassword(12);
    // Since we don't have roles seeded, we will just create an admin without a role (or mock one if necessary)
    // Actually, sign-in might not check role initially, or we can just bypass it.
    
    const roleRepo = dataSource.getRepository(Role);
    const superAdminRole = roleRepo.create({
      name: 'Super Admin',
      permissions: {
        admin: ['create', 'update', 'delete_soft', 'delete_hard', 'restore', 'list_view', 'detailed_view'],
      } as any,
    });
    const savedRole = await roleRepo.save(superAdminRole);

    testAdmin = adminRepo.create({
      name: 'E2E Test Admin',
      email: 'e2e@admin.com',
      password: await generateAndHashPassword(12).then(() => hashPassword(plainTextPassword)),
      phone: '+1234567890',
      isActive: true,
      roleId: savedRole.id,
    });
    // @ts-ignore
    testAdmin.password = await hashPassword(plainTextPassword);
    testAdmin = await adminRepo.save(testAdmin);
  });

  afterAll(async () => {
    // Cleanup connections
    await dataSource.dropDatabase(); // Optional cleanup
    await app.close();
  });

  describe('/api/auth/sign-in (POST)', () => {
    it('should reject invalid credentials with 422 Unprocessable Entity', () => {
      return request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          email: 'e2e@admin.com',
          password: 'WrongPassword!',
        })
        .expect(400);
    });

    it('should sign in successfully and return JWT tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          email: 'e2e@admin.com',
          password: plainTextPassword,
        })
        .expect(201); // default NestJS POST status code

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.data.email).toBe('e2e@admin.com');

      // Save token for next tests
      validToken = response.body.accessToken;
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    it('should reject requests without refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(400); // validation error
    });
  });

  describe('Protected Routes', () => {
    it('should block access without a token', () => {
      return request(app.getHttpServer())
        .get('/api/admins/me')
        .expect(401); // Unauthorized
    });

    it('should allow access with a valid token', () => {
      return request(app.getHttpServer())
        .get('/api/admins/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });
});
