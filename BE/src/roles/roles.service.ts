import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private usersService: UsersService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      this.logger.log(`Creating new role: ${createRoleDto.name}`);
      const role = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(role);
    } catch (error) {
      this.logger.error(`Failed to create role: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      this.logger.log('Retrieving all roles');
      return await this.roleRepository.find();
    } catch (error) {
      this.logger.error(`Failed to retrieve roles: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Role> {
    try {
      this.logger.log(`Retrieving role with ID: ${id}`);
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        this.logger.warn(`Role with ID "${id}" not found`);
        throw new NotFoundException(`Role with ID "${id}" not found`);
      }
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve role ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      this.logger.log(`Updating role with ID: ${id}`);
      const role = await this.findOne(id);
      this.roleRepository.merge(role, updateRoleDto);
      const updatedRole = await this.roleRepository.save(role);
      
      // Update users if role name has changed
      if (updateRoleDto.name && updateRoleDto.name !== role.name) {
        await this.usersService.updateUsersByRole(id, updateRoleDto.name);
      }
      
      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update role ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Removing role with ID: ${id}`);
      // Find the role first so we know it exists
      const role = await this.findOne(id);
      const result = await this.roleRepository.delete(id);
      
      if (result.affected === 0) {
        this.logger.warn(`Role with ID "${id}" not found for deletion`);
        throw new NotFoundException(`Role with ID "${id}" not found`);
      }
      
      // Update users after role is deleted
      await this.usersService.updateUsersByRole(id, null);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete role ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 