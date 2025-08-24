import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  beforeEach(async () => {
    userModel = function (this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ email: 'test3@test.com' });
    } as any;
    userModel.findOne = jest.fn();
    userModel.updateOne = jest.fn();
    userModel.create = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getModelToken('User'), useValue: userModel }],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if email exists', async () => {
    userModel.findOne.mockResolvedValue({ email: 'test@test.com' });
    await expect(service.createUser('Test User', 'test@test.com', 'Senha123!', 'user')).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw if password is weak', async () => {
    userModel.findOne.mockResolvedValue(null);
    await expect(service.createUser('Test2 User', 'test2@test.com', '123', 'user')).rejects.toThrow(
      ConflictException,
    );
  });

  it('should create user if valid', async () => {
    userModel.findOne.mockResolvedValue(null);
    const result = await service.createUser('Test3 User', 'test3@test.com', 'Senha123!', 'user');
    expect(result).toBeDefined();
  });

  it('should request password reset', async () => {
    userModel.findOne.mockResolvedValue({ email: 'test@test.com' });
    const result = await service.requestPasswordReset('test@test.com');
    expect(result.token).toBeDefined();
  });

  it('should reset password with valid token', async () => {
    userModel.findOne.mockResolvedValue({ email: 'test@test.com' });
    await service.requestPasswordReset('test@test.com');
    const token = Array.from((service as any).resetTokens.keys())[0] as string;
    await expect(service.resetPassword(token, 'Senha123!')).resolves.toBeDefined();
  });
});
