
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Orders System (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token for protected routes
    // Assuming there's a test user or we just test for unauthorized if no token
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/orders (GET)', () => {
    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders')
        .expect(401);
    });
  });

  describe('/orders/my-orders (GET)', () => {
    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders/my-orders')
        .expect(401);
    });
  });
});
