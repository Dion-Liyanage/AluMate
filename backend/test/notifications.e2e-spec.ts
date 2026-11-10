import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { User } from '../src/users/schemas/user.schema';
import { Order } from '../src/orders/schemas/order.schema';
import { Notification } from '../src/notifications/schemas/notification.schema';

/**
 * In-app notifications against a REAL database: placing an order creates a
 * notification, and the customer can list, count and mark them as read.
 *
 * Writes data, so like auth-flow it refuses to run against Atlas.
 */
describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let orderModel: Model<Order>;
  let notificationModel: Model<Notification>;
  let token: string;
  let otherToken: string;
  const createdEmails: string[] = [];

  const register = async (prefix: string) => {
    const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    createdEmails.push(email);
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ firstName: 'CI', lastName: 'Notify', email, password: 'Password123', phone: '0771234567' })
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(201);
    return res.body.data.token as string;
  };

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || '';
    if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
      throw new Error(
        'Refusing to run the notifications e2e test against a hosted (Atlas) database. ' +
          'Point MONGODB_URI at a local/throwaway MongoDB instead.',
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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

    userModel = moduleFixture.get(getModelToken(User.name));
    orderModel = moduleFixture.get(getModelToken(Order.name));
    notificationModel = moduleFixture.get(getModelToken(Notification.name));

    token = await register('ci-notify');
    otherToken = await register('ci-notify-other');
  });

  afterAll(async () => {
    if (userModel) {
      const users = await userModel.find({ email: { $in: createdEmails } }).lean();
      const ids = users.map((u) => u._id);
      await notificationModel.deleteMany({ userId: { $in: ids } });
      await orderModel.deleteMany({ customerId: { $in: ids } });
      await userModel.deleteMany({ _id: { $in: ids } });
    }
    if (app) await app.close();
  });

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('requires authentication', () => {
    return request(app.getHttpServer()).get('/api/v1/notifications').expect(401);
  });

  it('starts with no notifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set(auth(token))
      .expect(200);
    expect(res.body.data.count).toBe(0);
  });

  it('creates an "Order received" notification when an order is placed', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set(auth(token))
      .send({ productType: 'cabinet' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth(token))
      .expect(200);

    expect(res.body.data.total).toBe(1);
    const [n] = res.body.data.notifications;
    expect(n.title).toBe('Order received');
    expect(n.type).toBe('order');
    expect(n.isRead).toBe(false);
    expect(n.linkTo).toBe('/dashboard/orders');

    const count = await request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set(auth(token))
      .expect(200);
    expect(count.body.data.count).toBe(1);
  });

  it("does not show one customer's notifications to another", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth(otherToken))
      .expect(200);
    expect(res.body.data.total).toBe(0);
  });

  it("does not let another customer mark someone else's notification as read", async () => {
    const list = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth(token));
    const id = list.body.data.notifications[0]._id;

    await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${id}/read`)
      .set(auth(otherToken))
      .expect(404);
  });

  it('returns 404 for a malformed notification id', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/notifications/not-an-id/read')
      .set(auth(token))
      .expect(404);
  });

  it('marks a notification as read', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth(token));
    const id = list.body.data.notifications[0]._id;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${id}/read`)
      .set(auth(token))
      .expect(200);
    expect(res.body.data.isRead).toBe(true);

    const unread = await request(app.getHttpServer())
      .get('/api/v1/notifications?isRead=false')
      .set(auth(token))
      .expect(200);
    expect(unread.body.data.total).toBe(0);
  });

  it('marks all notifications as read', async () => {
    // Place two more orders → two more unread notifications
    for (let i = 0; i < 2; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(token))
        .send({ productType: 'cabinet' })
        .expect(201);
    }

    let count = await request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set(auth(token));
    expect(count.body.data.count).toBe(2);

    await request(app.getHttpServer())
      .patch('/api/v1/notifications/read-all')
      .set(auth(token))
      .expect(200);

    count = await request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set(auth(token));
    expect(count.body.data.count).toBe(0);
  });

  it('paginates results', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications?page=1&limit=2')
      .set(auth(token))
      .expect(200);
    expect(res.body.data.notifications).toHaveLength(2);
    expect(res.body.data.total).toBe(3);
  });
});
