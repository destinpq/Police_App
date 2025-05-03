import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProjectSeed } from './project/seed/project.seed';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly projectSeed: ProjectSeed) {}
  
  async onModuleInit() {
    // Run seeds on startup
    await this.projectSeed.seed();
  }
  
  getHello(): string {
    return 'Hello World!';
  }
}
