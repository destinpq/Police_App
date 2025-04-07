import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
    return this.userRepository.find({ 
      select: [
        'id', 'name', 'email', 'role', 'department', 
        'bio', 'phone', 'skills', 'avatar', 
        'createdAt', 'updatedAt'
      ] 
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
       where: { id },
       select: [
         'id', 'name', 'email', 'role', 'department', 
         'bio', 'phone', 'skills', 'avatar', 
         'createdAt', 'updatedAt'
       ] // Exclude password
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

  // Method used by auth service
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Reuse findOne to check existence and get current data

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    // Update other fields (excluding email if UpdateUserDto prevents it)
    Object.assign(user, { 
      ...updateUserDto, 
      password: undefined, 
      email: undefined 
    });

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  /**
   * Update users when their department changes
   * @param departmentId The ID of the department that was updated or deleted
   * @param newName The new name of the department (or null if deleted)
   */
  async updateUsersByDepartment(departmentId: string, newName: string | null): Promise<void> {
    try {
      this.logger.log(`Updating users with department ID ${departmentId} to ${newName || 'null'}`);
      
      // Find all users with the given department
      const users = await this.userRepository.find({ 
        where: { department: departmentId }
      });

      if (users.length === 0) {
        this.logger.log(`No users found with department ID ${departmentId}`);
        return;
      }

      // If the department was deleted, set department to null for all users
      // If it was updated, just leave it as is (references will still work)
      if (newName === null) {
        const updateResult = await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ department: undefined })
          .where("department = :departmentId", { departmentId })
          .execute();
        
        this.logger.log(`Updated ${updateResult.affected} users with department ID ${departmentId} to null`);
      }
    } catch (error) {
      this.logger.error(`Error updating users by department: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update users by department');
    }
  }

  /**
   * Update users when their role changes
   * @param roleId The ID of the role that was updated or deleted
   * @param newName The new name of the role (or null if deleted)
   */
  async updateUsersByRole(roleId: string, newName: string | null): Promise<void> {
    try {
      this.logger.log(`Updating users with role ID ${roleId} to ${newName || 'null'}`);
      
      // Find all users with the given role
      const users = await this.userRepository.find({ 
        where: { role: roleId }
      });

      if (users.length === 0) {
        this.logger.log(`No users found with role ID ${roleId}`);
        return;
      }

      // If the role was deleted, set role to null for all users
      // If it was updated, just leave it as is (references will still work)
      if (newName === null) {
        const updateResult = await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ role: undefined })
          .where("role = :roleId", { roleId })
          .execute();
        
        this.logger.log(`Updated ${updateResult.affected} users with role ID ${roleId} to null`);
      }
    } catch (error) {
      this.logger.error(`Error updating users by role: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update users by role');
    }
  }
} 