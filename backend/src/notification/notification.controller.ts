import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';

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
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testTask = {
      id: 0,
      title: 'Test Task',
      description: 'This is a test task notification email',
      status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'DONE',
      assignee: null,
      assignee_id: null,
      project: testProject,
      project_id: 1,
      deadline: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.notificationService.sendTaskAssignmentNotification(testUser, testTask);
    return { message: `Test email sent to ${data.email}` };
  }
} 