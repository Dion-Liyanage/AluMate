
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';

describe('Role-Based Access Control (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerToken: string;
  let adminToken: string;

  const customerId = '507f1f77bcf86cd799439011';
  const adminId = '507f1f77bcf86cd799439012';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    // Mock the auth service to return a valid user without hitting the DB
    const authService = moduleFixture.get<AuthService>(AuthService);
    jest.spyOn(authService, 'validateUser').mockImplementation(async (id: string) => {
      if (id === customerId) return { _id: customerId, role: 'customer', email: 'user@test.com' } as any;
      if (id === adminId) return { _id: adminId, role: 'admin', email: 'admin@test.com' } as any;
      return null;
    });

    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create mock tokens with valid IDs
    customerToken = jwtService.sign({ sub: customerId, email: 'user@test.com', role: 'customer' });
    adminToken = jwtService.sign({ sub: adminId, email: 'admin@test.com', role: 'admin' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin Analytics Protection', () => {
    it('should return 401 if no token provided', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/analytics/dashboard')
        .expect(401);
    });

    it('should return 403 (Forbidden) if customer tries to access admin route', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow admin to access the route', () => {
      // We expect 200 or 500 (if DB fails), but not 401/403
      return request(app.getHttpServer())
        .get('/api/v1/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .then(res => {
          expect(res.status).not.toBe(401);
          expect(res.status).not.toBe(403);
        });
    });
  });
});
