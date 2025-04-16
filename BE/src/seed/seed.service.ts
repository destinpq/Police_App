import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  
  async seed() {
    this.logger.log('Starting database seeding...');
    
    try {
      // Check if we have any data
      const userCount = await this.dataSource.getRepository(User).count();
      if (userCount > 0) {
        this.logger.log('Database already has data. Skipping seed operation.');
        return;
      }
      
      // Create roles
      this.logger.log('Creating roles...');
      const adminRole = await this.dataSource.getRepository(Role).save({
        name: 'Admin',
        description: 'Administrator with full access',
        isAdmin: true,
      });
      
      const managerRole = await this.dataSource.getRepository(Role).save({
        name: 'Manager',
        description: 'Project manager with team management access',
        isAdmin: false,
      });
      
      const memberRole = await this.dataSource.getRepository(Role).save({
        name: 'Team Member',
        description: 'Regular team member',
        isAdmin: false,
      });
      
      // Create departments
      this.logger.log('Creating departments...');
      const engineeringDept = await this.dataSource.getRepository(Department).save({
        name: 'Engineering',
        description: 'Software development team',
        manager: 'Engineering Manager',
      });
      
      const marketingDept = await this.dataSource.getRepository(Department).save({
        name: 'Marketing',
        description: 'Marketing and promotion team',
        manager: 'Marketing Director',
      });
      
      const designDept = await this.dataSource.getRepository(Department).save({
        name: 'Design',
        description: 'Design and UX team',
        manager: 'Design Lead',
      });
      
      // Create users
      this.logger.log('Creating users...');
      const passwordHash = await bcrypt.hash('password123', 10);
      
      const adminUser = await this.dataSource.getRepository(User).save({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: adminRole,
        roleId: adminRole.id,
        department: engineeringDept,
        departmentId: engineeringDept.id,
        bio: 'System administrator',
        phone: '555-1234',
        skills: 'Administration, Security',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
      });
      
      const manager1 = await this.dataSource.getRepository(User).save({
        name: 'Project Manager',
        email: 'manager@example.com',
        passwordHash,
        role: managerRole,
        roleId: managerRole.id,
        department: engineeringDept,
        departmentId: engineeringDept.id,
        bio: 'Experienced project manager',
        phone: '555-5678',
        skills: 'Project Management, Agile, Scrum',
        avatar: 'https://ui-avatars.com/api/?name=Project+Manager',
      });
      
      const user1 = await this.dataSource.getRepository(User).save({
        name: 'Team Member 1',
        email: 'user1@example.com',
        passwordHash,
        role: memberRole,
        roleId: memberRole.id,
        department: engineeringDept,
        departmentId: engineeringDept.id,
        bio: 'Frontend developer',
        phone: '555-9012',
        skills: 'React, TypeScript, CSS',
        avatar: 'https://ui-avatars.com/api/?name=Team+Member+1',
      });
      
      const user2 = await this.dataSource.getRepository(User).save({
        name: 'Team Member 2',
        email: 'user2@example.com',
        passwordHash,
        role: memberRole,
        roleId: memberRole.id,
        department: designDept,
        departmentId: designDept.id,
        bio: 'UI/UX designer',
        phone: '555-3456',
        skills: 'Figma, Sketch, User Research',
        avatar: 'https://ui-avatars.com/api/?name=Team+Member+2',
      });
      
      // Create projects
      this.logger.log('Creating projects...');
      const project1 = await this.dataSource.getRepository(Project).save({
        name: 'Website Redesign',
        description: 'Redesign the company website with a modern look and feel',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        priority: 'high',
        manager: manager1,
        managerId: manager1.id,
        department: designDept,
        departmentId: designDept.id,
        budget: '25000',
        tags: 'design,frontend,website',
      });
      
      const project2 = await this.dataSource.getRepository(Project).save({
        name: 'Mobile App Development',
        description: 'Create a mobile app for our customers',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'planning',
        priority: 'medium',
        manager: manager1,
        managerId: manager1.id,
        department: engineeringDept,
        departmentId: engineeringDept.id,
        budget: '50000',
        tags: 'mobile,app,development',
      });
      
      this.logger.log('Seed completed successfully!');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }
  
  // Method to truncate all tables for testing
  async truncate() {
    this.logger.warn('Truncating all tables...');
    
    try {
      await this.dataSource.query('DELETE FROM tasks');
      await this.dataSource.query('DELETE FROM projects');
      await this.dataSource.query('DELETE FROM users');
      await this.dataSource.query('DELETE FROM departments');
      await this.dataSource.query('DELETE FROM roles');
      await this.dataSource.query('DELETE FROM tags');
      
      this.logger.log('All tables truncated successfully');
      return { message: 'All tables truncated successfully' };
    } catch (error) {
      this.logger.error('Error truncating tables:', error);
      throw error;
    }
  }
} 