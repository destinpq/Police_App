import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async seedUsers() {
    const defaultUsers = [
      { email: 'drakankasha@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
      { email: 'pratik@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
      { email: 'shauryabansal@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
      { email: 'mohitagrwal@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
      { email: 'tejaswi.ranganeni@destinpq.com', password: 'DestinPQ@24225', isAdmin: false },
      { email: 'admin@destinpq.com', password: 'DestinPQ@24225', isAdmin: true },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        await this.usersRepository.save(userData);
      } else if (userData.email === 'admin@destinpq.com' && !existingUser.isAdmin) {
        // Make sure admin@destinpq.com is always an admin
        existingUser.isAdmin = true;
        await this.usersRepository.save(existingUser);
      }
    }
  }

  async ensureAdminStatus(): Promise<{ message: string }> {
    // This method ensures that admin@destinpq.com is always an admin
    const admin = await this.usersRepository.findOne({
      where: { email: 'admin@destinpq.com' },
    });

    if (admin && !admin.isAdmin) {
      admin.isAdmin = true;
      await this.usersRepository.save(admin);
      return { message: 'Admin status restored for admin@destinpq.com' };
    } else if (!admin) {
      // Create admin if it doesn't exist
      await this.usersRepository.save({
        email: 'admin@destinpq.com',
        password: 'DestinPQ@24225',
        isAdmin: true,
      });
      return { message: 'Admin user created' };
    }

    return { message: 'Admin status already set correctly' };
  }

  async setAdminStatus(email: string, isAdmin: boolean): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`User with email ${email} not found`);
    }

    user.isAdmin = isAdmin;
    await this.usersRepository.save(user);
    return { message: `Admin status ${isAdmin ? 'granted to' : 'revoked from'} ${email}` };
  }
} 