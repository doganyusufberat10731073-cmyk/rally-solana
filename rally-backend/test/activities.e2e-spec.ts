import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Activities API (E2E Integration Flow)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/activities/featured - should return featured activities', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/activities/featured')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/activities - should support category and keyword filtering', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/activities?category=Development&limit=5')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('items');
    expect(response.body.data).toHaveProperty('meta');
  });

  it('POST /api/activities - should reject unauthenticated requests with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/activities')
      .send({
        title: 'Unauthorized Event',
        description: 'Should fail',
        category: 'Development',
        location: 'Nowhere',
        date: '2026-09-20',
        time: '12:00',
        duration: '1h',
        maxParticipants: 4,
      })
      .expect(401);
  });
});
