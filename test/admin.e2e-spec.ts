import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { useContainer } from 'class-validator';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('Unhandled Exception:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: exception instanceof Error ? exception.message : 'Internal server error',
    });
  }
}
const request = require('supertest');
import { AdminAppModule } from '../apps/admin-api/src/admin-app.module';
import { DataSource } from 'typeorm';
import { RedisService, Admin, Role } from '@libs/index';
import { generateAndHashPassword } from '../apps/admin-api/src/modules/admin/utils/password-generator.util';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let redisService: RedisService;
  let adminRepo: any;
  let roleRepo: any;

  let validToken: string;
  let createdAdminId: number;
  let createdRoleId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminAppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    useContainer(app.select(AdminAppModule), { fallbackOnErrors: true });
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    app.useGlobalFilters(new AllExceptionsFilter());

    dataSource = app.get(DataSource);
    redisService = app.get(RedisService);
    adminRepo = dataSource.getRepository(Admin);
    roleRepo = dataSource.getRepository(Role);

    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await redisService.flushall();

    // Seed Super Admin Role
    const superAdminRole = roleRepo.create({
      name: 'Super Admin',
      permissions: {
        admin: ['create', 'update', 'delete_soft', 'delete_hard', 'restore', 'list_view', 'detailed_view'],
      } as any,
    });
    const savedRole = await roleRepo.save(superAdminRole);
    createdRoleId = savedRole.id;

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
    // @ts-ignore
    testAdmin.password = await generateAndHashPassword(12).then(res => res.hashedPassword); // temporary 
    
    const { hashedPassword } = await generateAndHashPassword(12);
    // Since we don't expose bcrypt hash globally easily here, we'll use a hack to just log in
    // wait, we can just use the hashPassword util from @libs/index
    const { hashPassword } = require('@libs/index');
    testAdmin.password = await hashPassword(plainTextPassword);

    await adminRepo.save(testAdmin);

    const dbUser = await adminRepo.findOne({ where: { email: 'super@admin.com' } });

    // Authenticate
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'super@admin.com', password: plainTextPassword });
    
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      throw new Error(`Login failed in beforeAll: ${JSON.stringify(loginRes.body)}`);
    }

    validToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('/admins (POST)', () => {
    it('should create a new admin', () => {
      return request(app.getHttpServer())
        .post('/api/admins')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'New Test Admin',
          email: 'new@admin.com',
          phone: '+12345678901',
          isActive: true,
          roleId: createdRoleId
        })
        .expect(201)
        .then((res: any) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('new@admin.com');
          createdAdminId = res.body.id;
        });
    });
  });

  describe('/admins (GET)', () => {
    it('should list all admins', () => {
      return request(app.getHttpServer())
        .get('/api/admins')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .then((res: any) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        })
        .catch(err => {
          throw new Error('GET /api/admins failed: ' + JSON.stringify(err.response?.body || err));
        });
    });
  });

  describe('/admins/:id (GET)', () => {
    it('should get a specific admin', () => {
      return request(app.getHttpServer())
        .get(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .then((res: any) => {
          expect(res.body.id).toBe(createdAdminId);
          expect(res.body.email).toBe('new@admin.com');
        });
    });
  });

  describe('/admins/:id (PATCH)', () => {
    it('should update an admin', () => {
      return request(app.getHttpServer())
        .patch(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Updated Admin Name',
        })
        .expect(200)
        .then((res: any) => {
          expect(res.body.name).toBe('Updated Admin Name');
        });
    });
  });

  describe('/admins/:id (DELETE)', () => {
    it('should soft delete an admin', () => {
      return request(app.getHttpServer())
        .delete(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });

  describe('/admins/restore/:id (POST)', () => {
    it('should restore a soft-deleted admin', () => {
      return request(app.getHttpServer())
        .post(`/api/admins/restore/${createdAdminId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(201);
    });
  });

  describe('/admins/:id/hard-delete (DELETE)', () => {
    it('should permanently delete an admin', () => {
      return request(app.getHttpServer())
        .delete(`/api/admins/${createdAdminId}/hard-delete`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });
});
