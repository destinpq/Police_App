import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    // Exclude password hash from general find operations
    return this.userRepository.find({ select: ['id', 'name', 'email', 'createdAt', 'updatedAt'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
       where: { id },
       select: ['id', 'name', 'email', 'createdAt', 'updatedAt'] // Exclude password
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  // Specific method for authentication to retrieve password hash
  async findOneByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Reuse findOne to check existence and get current data

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }
    // Update other fields (excluding email if UpdateUserDto prevents it)
    Object.assign(user, { ...updateUserDto, password: undefined, email: undefined });

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
} 