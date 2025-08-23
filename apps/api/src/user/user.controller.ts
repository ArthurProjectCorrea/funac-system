import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    // Retorna todos os usuários, exceto senha
    return this.userService.getAllUsers();
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string; role?: string }) {
    return this.userService.createUser(body.name, body.email, body.password, body.role);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.userService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.userService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    // Retorna todos os dados do usuário, exceto senha
    return this.userService.getUserProfileById(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('admin')
  getAdminResource(@Req() req: Request & { user?: any }) {
    return { message: 'Acesso permitido apenas para admin', user: req.user };
  }
}
