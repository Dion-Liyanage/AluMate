import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { User } from '../src/users/schemas/user.schema';

/**
 * Happy-path authentication flow against a REAL database.
 *
 * Unlike the other e2e tests (which mostly check that bad input is rejected),
 * this one registers a real user, logs in with the correct password and uses
 * the returned token on protected routes.
 *
 * It writes data, so it must only ever run against a throwaway database
 * (the MongoDB service container in CI). It refuses to run against Atlas.
 */
describe('Authentication happy path (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let token: string;

  // Unique per run so repeated runs never collide
  const testUser = {
    firstName: 'CI',
    lastName: 'Tester',
    email: `ci-user-${Date.now()}@example.com`,
    password: 'Password123',
    phone: '0771234567',
  };

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || '';
    if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
      throw new Error(
        'Refusing to run the auth-flow e2e test against a hosted (Atlas) database. ' +
          'Point MONGODB_URI at a local/throwaway MongoDB instead.',
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Never send real emails from tests
      .overrideProvider(MailService)
      .useValue({
        sendEmail: jest.fn().mockResolvedValue(undefined),
        sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
        sendQuotationReady: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  afterAll(async () => {
    // Clean up the user this test created
    if (userModel) {
      await userModel.deleteOne({ email: testUser.email.toLowerCase() });
    }
    if (app) {
      await app.close();
    }
  });

  it('registers a new user with valid details', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('stores the password hashed, never in plain text', async () => {
    const saved = await userModel.findOne({ email: testUser.email }).lean();
    expect(saved).toBeTruthy();
    expect(saved!.password).not.toBe(testUser.password);
    expect(saved!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
  });

  it('rejects registering the same email twice (409)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('logs in with the correct email and password and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.password).toBeUndefined();

    token = res.body.data.token;
  });

  it('logs in even if the email is typed in a different case', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email.toUpperCase(), password: testUser.password })
      .expect(201);
  });

  it('rejects the correct email with the wrong password (401)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword1' })
      .expect(401);
  });

  it('returns the logged-in user profile from /auth/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('customer');
  });

  it('lets the logged-in customer open their own orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
    expect(res.body.data.orders).toHaveLength(0); // brand-new user
  });

  it('rejects a tampered token (401)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}tampered`)
      .expect(401);
  });

  it('blocks a real logged-in customer from admin routes (403)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
