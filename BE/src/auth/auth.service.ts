import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await this.comparePassword(password, user.passwordHash)) {
        const { passwordHash, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      // Check if user with this email already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Create new user
      const user = await this.usersService.create({
        name,
        email,
        password,
      });
      
      // Return token and user info
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error during registration: ${error.message}`, error.stack);
      throw new UnauthorizedException('Registration failed');
    }
  }

  private async comparePassword(enteredPassword: string, passwordHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(enteredPassword, passwordHash);
    } catch (error) {
      this.logger.error(`Error comparing passwords: ${error.message}`, error.stack);
      return false;
    }
  }
} 