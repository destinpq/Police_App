import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../departments/entities/department.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user: ${createUserDto.email}`);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    let role: Role | null = null;
    if (createUserDto.roleId) {
      role = await this.userRepository.manager.findOne(Role, { where: { id: createUserDto.roleId } });
      if (!role) throw new NotFoundException(`Role with ID "${createUserDto.roleId}" not found`);
      this.logger.log(`Found role: ${role.name}`);
    }
    
    let department: Department | null = null;
    if (createUserDto.departmentId) {
      department = await this.userRepository.manager.findOne(Department, { where: { id: createUserDto.departmentId } });
      if (!department) throw new NotFoundException(`Department with ID "${createUserDto.departmentId}" not found`);
      this.logger.log(`Found department: ${department.name}`);
    }

    // Prepare data for creation, excluding the raw password
    const { password, ...userData } = createUserDto;
    const newUser = this.userRepository.create({
      ...userData,
      passwordHash: hashedPassword,
      role: role, 
      department: department,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`Successfully created user ${savedUser.id} (${savedUser.email})`);
      // Return user with relations loaded (findOne handles this)
      return this.findOne(savedUser.id);
    } catch (error) {
      this.logger.error(`Failed to save user ${createUserDto.email}: ${error.message}`, error.stack);
      if (error.code === '23505') { // PostgreSQL unique violation code
          throw new InternalServerErrorException('Email already exists.');
      }
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  findAll(): Promise<User[]> {
    this.logger.log('Fetching all users with relations');
    return this.userRepository.find({
      relations: ['role', 'department'],
    });
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user ${id} with relations`);
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'department'],
    });
    if (!user) {
      this.logger.warn(`User with ID "${id}" not found`);
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.logger.log(`Found user ${id}: ${user.email}`);
    return user;
  }

  // Specific method for authentication - keeps loading password hash
  async findOneByEmailForAuth(email: string): Promise<User | null> {
    this.logger.log(`Fetching user by email for auth: ${email}`);
    // Need to explicitly select passwordHash as it's { select: false } in the entity
    return this.userRepository.findOne({
        where: { email },
        select: ['id', 'name', 'email', 'passwordHash', 'roleId', 'departmentId', 'bio', 'phone', 'skills', 'avatar', 'createdAt', 'updatedAt'],
        relations: ['role', 'department'],
    });
  }

  // Method used by auth service (maybe should be removed if findOneByEmailForAuth is enough)
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Fetching user by email (no password): ${email}`);
    return this.userRepository.findOne({
        where: { email },
        relations: ['role', 'department'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Attempting to update user ${id}`);
    // Use query builder to fetch user and relations to avoid loading password hash unless needed
    const user = await this.userRepository.findOne({ where: { id }, relations: ['role', 'department'] });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Update password if provided
    if (updateUserDto.password) {
      this.logger.log(`Updating password for user ${id}`);
      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
      updateUserDto.password = undefined; // Remove from DTO to avoid direct assignment
    }

    // Update role if roleId is provided
    if (updateUserDto.roleId !== undefined) {
      if (updateUserDto.roleId === null) {
        this.logger.log(`Removing role from user ${id}`);
        user.role = null;
      } else {
        this.logger.log(`Updating role for user ${id} to ${updateUserDto.roleId}`);
        const role = await this.userRepository.manager.findOne(Role, { where: { id: updateUserDto.roleId } });
        if (!role) throw new NotFoundException(`Role with ID "${updateUserDto.roleId}" not found`);
        user.role = role;
      }
    }

    // Update department if departmentId is provided
    if (updateUserDto.departmentId !== undefined) {
      if (updateUserDto.departmentId === null) {
        this.logger.log(`Removing department from user ${id}`);
        user.department = null;
      } else {
        this.logger.log(`Updating department for user ${id} to ${updateUserDto.departmentId}`);
        const department = await this.userRepository.manager.findOne(Department, { where: { id: updateUserDto.departmentId } });
        if (!department) throw new NotFoundException(`Department with ID "${updateUserDto.departmentId}" not found`);
        user.department = department;
      }
    }

    // Update other fields from DTO, excluding handled ones
    const { password, roleId, departmentId, ...otherUpdateData } = updateUserDto;
    Object.assign(user, otherUpdateData);

    try {
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`Successfully updated user ${id}`);
      // Return the updated user with relations loaded
      return this.findOne(updatedUser.id);
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to remove user ${id}`);
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User with ID "${id}" not found for deletion`);
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.logger.log(`Successfully removed user ${id}`);
  }

  /**
   * Update users when their department changes (adjusting to use relation)
   */
  async updateUsersByDepartment(departmentId: string, newName: string | null): Promise<void> {
    try {
      if (newName === null) {
        this.logger.log(`Setting departmentId to null for users linked to deleted department ${departmentId}`);
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ department: null, departmentId: null })
          .where("departmentId = :departmentId", { departmentId })
          .execute();
      }
    } catch (error) {
      this.logger.error(`Error updating users by department ${departmentId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update users by department');
    }
  }

  /**
   * Update users when their role changes (adjusting to use relation)
   */
  async updateUsersByRole(roleId: string, newName: string | null): Promise<void> {
    try {
      if (newName === null) {
        this.logger.log(`Setting roleId to null for users linked to deleted role ${roleId}`);
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ role: null, roleId: null })
          .where("roleId = :roleId", { roleId })
          .execute();
      }
    } catch (error) {
      this.logger.error(`Error updating users by role ${roleId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update users by role');
    }
  }
} 