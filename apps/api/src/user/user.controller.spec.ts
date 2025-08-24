import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<UserService>;

  beforeEach(async () => {
    userService = {
      createUser: jest.fn().mockResolvedValue({ email: 'test@test.com' }),
      requestPasswordReset: jest.fn().mockResolvedValue({ message: 'ok', token: 'token' }),
      resetPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    const result = await controller.register({ email: 'test@test.com', password: 'Senha123!' });
    expect(result.email).toBe('test@test.com');
  });

  it('should request password reset', async () => {
    const result = await (controller as any).requestPasswordReset({ email: 'test@test.com' });
    expect(result.token).toBe('token');
  });

  it('should reset password', async () => {
    const result = await (controller as any).resetPassword({
      token: 'token',
      newPassword: 'Senha123!',
    });
    expect(result.message).toBe('ok');
  });

  it('should get profile', () => {
    const req = { user: { email: 'test@test.com' } } as any;
    expect(controller.getProfile(req)).toEqual({ email: 'test@test.com' });
  });

  it('should get admin resource', () => {
    const req = { user: { email: 'admin@test.com', role: 'admin' } } as any;
    expect(controller.getAdminResource(req)).toEqual({
      message: 'Acesso permitido apenas para admin',
      user: req.user,
    });
  });
});
