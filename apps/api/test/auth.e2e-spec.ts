import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Auth E2E', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let server: any;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    const dbConnection = app.get(getConnectionToken());
    await dbConnection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve registrar, logar e recuperar dados do usuário logado', async () => {
    // Registrar usuário
    const register = await request(server)
      .post('/user/register')
      .send({ email: 'e2euser@test.com', password: 'Senha123!' });
    expect(register.status).toBe(201);
    expect(register.body.email).toBe('e2euser@test.com');

    // Login
    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'e2euser@test.com', password: 'Senha123!' });
    expect(login.status).toBe(201);
    expect(login.body.access_token).toBeDefined();
    const token = login.body.access_token;

    // Recuperar dados do usuário logado
    const res = await request(server).get('/user/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('e2euser@test.com');
  });

  it('deve rejeitar acesso sem token', async () => {
    const res = await request(server).get('/user/me');
    expect(res.status).toBe(401);
  });
});
