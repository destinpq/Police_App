import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../user/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;
  private readonly mailUser: string;
  private readonly mailFrom: string;

  constructor(private configService: ConfigService) {
    this.mailUser = this.configService.get<string>('MAIL_USER') || '';
    this.mailFrom = this.configService.get<string>('MAIL_FROM') || '';
    
    // Initialize the transporter with GoDaddy SMTP settings (for sending)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || '',
      port: parseInt(this.configService.get<string>('MAIL_PORT') || '587', 10),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.mailUser,
        pass: this.configService.get<string>('MAIL_PASSWORD') || '',
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify email connection on service initialization
   */
  private async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection established successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to establish SMTP connection: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send a task assignment notification email
   */
  async sendTaskAssignmentNotification(user: User, task: Task): Promise<void> {
    try {
      const mailOptions = {
        from: {
          name: 'Task Tracker',
          address: this.mailFrom,
        },
        to: user.email,
        subject: `Task Assigned: ${task.title}`,
        html: `
          <h1>Task Assignment Notification</h1>
          <p>Hello,</p>
          <p>You have been assigned a new task:</p>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h2 style="color: #1677ff;">${task.title}</h2>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Status:</strong> ${task.status}</p>
          </div>
          <p>Please login to the Task Tracker application to view and manage this task.</p>
          <p>Regards,<br>Task Tracker Team</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${user.email}: ${info.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification to ${user.email}: ${errorMessage}`);
    }
  }
} 