import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() loginDto: LoginDto): Promise<{ user: User }> {
    const user = await this.loginService.login(loginDto);
    return { user };
  }

  @Get('seed')
  async seedUsers() {
    await this.loginService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

  @Get('ensure-admin')
  async ensureAdminStatus() {
    return await this.loginService.ensureAdminStatus();
  }

  @Post('admin-status')
  async setAdminStatus(@Body() body: { email: string; isAdmin: boolean }) {
    return await this.loginService.setAdminStatus(body.email, body.isAdmin);
  }
} 