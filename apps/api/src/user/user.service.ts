import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) public userModel: Model<UserDocument>) {}

  async getUserProfileById(id: string) {
    // Retorna todos os dados do usuário, exceto a senha
    return this.userModel.findById(id).select('-password');
  }

  async getAllUsers() {
    // Retorna todos os usuários, exceto senha
    return this.userModel.find().select('-password');
  }

  // Simples: armazena tokens de redefinição em memória (mock)
  private resetTokens = new Map<string, string>();

  async requestPasswordReset(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) return { message: 'Se o e-mail existir, um link será enviado.' };
    // Gera token simples (mock, não seguro para produção)
    const token = Math.random().toString(36).substring(2, 15);
    this.resetTokens.set(token, email);
    // Aqui você enviaria o e-mail com o token
    return { message: 'Token de redefinição gerado (mock)', token };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const email = this.resetTokens.get(token);
    if (!email) throw new ConflictException('Token inválido ou expirado');
    if (!this.isStrongPassword(newPassword)) {
      throw new ConflictException(
        'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.',
      );
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.userModel.updateOne({ email }, { password: hash });
    this.resetTokens.delete(token);
    return { message: 'Senha redefinida com sucesso' };
  }

  async createUser(name: string, email: string, password: string, role = 'user'): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) throw new ConflictException('E-mail já cadastrado');
    // Validação de força de senha
    if (!this.isStrongPassword(password)) {
      throw new ConflictException(
        'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.',
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, email: normalizedEmail, password: hash, role });
    return user.save();
  }

  private isStrongPassword(password: string): boolean {
    // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      password,
    );
  }
}
