import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { User } from '../src/users/schemas/user.schema';
import { SavedDesign } from '../src/saved-designs/schemas/saved-design.schema';

/**
 * Saved designs against a REAL database: save, list, open, import from the
 * old browser storage, and per-user isolation. Refuses to run against Atlas.
 */
describe('Saved designs (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let savedDesignModel: Model<SavedDesign>;
  let token: string;
  let otherToken: string;
  const createdEmails: string[] = [];

  const register = async (prefix: string) => {
    const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    createdEmails.push(email);
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ firstName: 'CI', lastName: 'Saved', email, password: 'Password123', phone: '0771234567' })
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(201);
    return res.body.data.token as string;
  };

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const design = {
    name: 'Kitchen Cabinet',
    productType: 'cabinet',
    designJson: '{"objects":[]}',
    previewImage: 'data:image/png;base64,AAAA',
    description: 'Test design',
  };

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || '';
    if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
      throw new Error(
        'Refusing to run the saved-designs e2e test against a hosted (Atlas) database. ' +
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
    savedDesignModel = moduleFixture.get(getModelToken(SavedDesign.name));

    token = await register('ci-saved');
    otherToken = await register('ci-saved-other');
  });

  afterAll(async () => {
    if (userModel) {
      const users = await userModel.find({ email: { $in: createdEmails } }).lean();
      const ids = users.map((u) => u._id);
      await savedDesignModel.deleteMany({ userId: { $in: ids } });
      await userModel.deleteMany({ _id: { $in: ids } });
    }
    if (app) await app.close();
  });

  it('requires authentication', () => {
    return request(app.getHttpServer()).get('/api/v1/saved-designs').expect(401);
  });

  it('saves, lists (without canvas JSON) and opens a design', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/saved-designs/design-1')
      .set(auth(token))
      .send(design)
      .expect(200);

    const list = await request(app.getHttpServer())
      .get('/api/v1/saved-designs')
      .set(auth(token))
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe('design-1');
    expect(list.body.data[0].designJson).toBeUndefined();

    const one = await request(app.getHttpServer())
      .get('/api/v1/saved-designs/design-1')
      .set(auth(token))
      .expect(200);
    expect(one.body.data.designJson).toBe(design.designJson);
  });

  it('updates an existing design in place', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/saved-designs/design-1')
      .set(auth(token))
      .send({ ...design, name: 'Renamed' })
      .expect(200);

    const list = await request(app.getHttpServer())
      .get('/api/v1/saved-designs')
      .set(auth(token))
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].name).toBe('Renamed');
  });

  it('imports old browser designs once, keeping ids and dates, never overwriting', async () => {
    const legacy = [
      { ...design, id: 'design-1', name: 'Old copy' }, // already exists — must not overwrite
      {
        ...design,
        id: 'legacy-2',
        name: 'Legacy Window',
        createdAt: '2026-01-02T03:04:05.000Z',
        updatedAt: '2026-01-03T03:04:05.000Z',
      },
    ];

    const first = await request(app.getHttpServer())
      .post('/api/v1/saved-designs/import')
      .set(auth(token))
      .send({ designs: legacy })
      .expect(201);
    expect(first.body.data.imported).toBe(1);

    const again = await request(app.getHttpServer())
      .post('/api/v1/saved-designs/import')
      .set(auth(token))
      .send({ designs: legacy })
      .expect(201);
    expect(again.body.data.imported).toBe(0);

    const list = await request(app.getHttpServer())
      .get('/api/v1/saved-designs')
      .set(auth(token))
      .expect(200);
    const byId = Object.fromEntries(list.body.data.map((d: any) => [d.id, d]));
    expect(byId['design-1'].name).toBe('Renamed');
    expect(byId['legacy-2'].createdAt).toBe('2026-01-02T03:04:05.000Z');
  });

  it("does not show or delete another user's designs", async () => {
    const list = await request(app.getHttpServer())
      .get('/api/v1/saved-designs')
      .set(auth(otherToken))
      .expect(200);
    expect(list.body.data).toHaveLength(0);

    await request(app.getHttpServer())
      .get('/api/v1/saved-designs/design-1')
      .set(auth(otherToken))
      .expect(404);
    await request(app.getHttpServer())
      .delete('/api/v1/saved-designs/design-1')
      .set(auth(otherToken))
      .expect(404);
  });

  it('deletes a design', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/saved-designs/legacy-2')
      .set(auth(token))
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/v1/saved-designs/legacy-2')
      .set(auth(token))
      .expect(404);
  });
});
