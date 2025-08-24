import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { Model } from 'mongoose';
import { LoginAttempt } from './login-attempt.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<UserService>;
  let loginAttemptModel: Partial<Model<LoginAttempt>>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    userService = {
      userModel: {
        findOne: jest.fn().mockResolvedValue({
          email: 'test@test.com',
          password: '$2a$10$hash',
          role: 'user',
          _id: '1',
        }),
      },
    } as any;
    loginAttemptModel = { create: jest.fn() } as any;
    jwtService = { sign: jest.fn().mockReturnValue('token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: getModelToken(LoginAttempt.name), useValue: loginAttemptModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login and return token', async () => {
    jest.spyOn(service, 'validateUser').mockResolvedValue({
      email: 'test@test.com',
      password: 'hash',
      role: 'user',
      _id: '1',
    } as any);
    const result = await service.login('test@test.com', 'senha', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    } as any);
    expect(result.access_token).toBe('token');
    expect(result.email).toBe('test@test.com');
  });

  it('should register login attempt', async () => {
    const spy = jest.spyOn(loginAttemptModel, 'create');
    try {
      await service.validateUser('test@test.com', 'senha', '127.0.0.1');
    } catch {}
    expect(spy).toHaveBeenCalled();
  });
});
