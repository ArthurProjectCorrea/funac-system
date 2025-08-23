import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginAttempt, LoginAttemptDocument } from './login-attempt.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(LoginAttempt.name) private loginAttemptModel: Model<LoginAttemptDocument>,
  ) {}

  async validateUser(email: string, password: string, ip?: string) {
    const user = await this.userService['userModel'].findOne({ email });
    let success = false;
    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      success = valid;
    }
    await this.loginAttemptModel.create({ email, success, ip });
    if (!user || !success) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  async login(email: string, password: string, req?: Request) {
    const ip = (req as any)?.ip || (req as any)?.headers['x-forwarded-for'] || undefined;
    const user = await this.validateUser(email, password, ip);
    // Buscar usuário completo para garantir que o name está presente
    const dbUser = await this.userService.userModel.findById(user._id);
    if (!dbUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const payload = { sub: dbUser._id, email: dbUser.email, role: dbUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      id: dbUser._id,
    };
  }
}
