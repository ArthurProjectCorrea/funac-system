import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      login: jest
        .fn()
        .mockResolvedValue({ access_token: 'token', user: { email: 'test@test.com' } }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login and return token', async () => {
    const result = await controller.login({ email: 'test@test.com', password: 'senha' }, {} as any);
    expect(result.access_token).toBe('token');
    expect(result.user.email).toBe('test@test.com');
  });
});
