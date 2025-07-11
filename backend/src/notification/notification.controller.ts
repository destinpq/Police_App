import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test-email')
  async sendTestEmail(@Body() data: { email: string }): Promise<{ message: string }> {
    const testUser: User = {
      id: 0,
      email: data.email,
      password: '',
      isAdmin: false,
      tasks: []
    };

    const testProject: Project = {
      id: 1,
      name: 'Test Project',
      description: 'A test project for notifications',
      budget: 0,
      budgetSpent: 0,
      budgetCurrency: 'USD',
      tasks: [],
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testTask: Task = {
      id: 0,
      title: 'Test Task',
      description: 'This is a test task notification email',
      status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
      assignee: null,
      assignee_id: null,
      project: testProject,
      project_id: 1,
      milestone: null,
      milestone_id: null,
      deadline: null,
      completedAt: null,
      moneySpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.notificationService.sendTaskAssignmentNotification(testUser, testTask);
    return { message: `Test email sent to ${data.email}` };
  }

  @Post('account-creation')
  async sendAccountCreationEmail(@Body() data: { email: string; isAdmin?: boolean }): Promise<{ message: string }> {
    const testUser: User = {
      id: 0,
      email: data.email,
      password: 'DestinPQ@24225',
      isAdmin: data.isAdmin || false,
      tasks: []
    };

    await this.notificationService.sendAccountCreationNotification(testUser);
    return { message: `Account creation email sent to ${data.email}` };
  }
} 