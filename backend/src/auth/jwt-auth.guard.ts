import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // For this simple app, the token is just the user's email
      // In a real app, you would use JWT verification here
      const user = await this.usersRepository.findOne({ 
        where: { email: token } 
      });
      
      if (!user) {
        throw new UnauthorizedException('Invalid authentication token');
      }
      
      // Attach the user to the request object
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return undefined;
    }
    
    return authorization.replace('Bearer ', '');
  }
} 