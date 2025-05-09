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
    // Get mail configuration from environment
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = parseInt(this.configService.get<string>('MAIL_PORT') || '465', 10);
    const mailSecure = this.configService.get<string>('MAIL_SECURE') === 'true';
    this.mailUser = this.configService.get<string>('MAIL_USER') || '';
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD') || '';
    this.mailFrom = this.configService.get<string>('MAIL_FROM') || '';
    
    // Log mail configuration (without password) for debugging
    this.logger.log(`Mail configuration: Host=${mailHost}, Port=${mailPort}, Secure=${mailSecure}, User=${this.mailUser}, From=${this.mailFrom}`);
    
    if (!mailHost || !this.mailUser || !mailPassword) {
      this.logger.error('Mail configuration is incomplete. Email notifications will not work.');
      return;
    }
    
    // Initialize the transporter with GoDaddy SMTP settings (for sending)
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailSecure, // true for 465, false for other ports
      auth: {
        user: this.mailUser,
        pass: mailPassword,
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
      debug: true, // Enable debug output
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify email connection on service initialization
   */
  private async verifyConnection(): Promise<boolean> {
    try {
      this.logger.log('Verifying SMTP connection...');
      await this.transporter.verify();
      this.logger.log('SMTP connection established successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to establish SMTP connection: ${errorMessage}`);
      
      // Log additional information about the error
      if (error instanceof Error && 'code' in error) {
        this.logger.error(`Error code: ${(error as any).code}`);
      }
      
      return false;
    }
  }

  /**
   * Send a task assignment notification email
   */
  async sendTaskAssignmentNotification(user: User, task: Task): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Cannot send email: mail transporter not initialized');
      return;
    }
    
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