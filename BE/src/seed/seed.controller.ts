import { Controller, Post, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    await this.seedService.seed();
    return { message: 'Database seeded successfully' };
  }

  @Post('truncate')
  @HttpCode(HttpStatus.OK)
  async truncate() {
    return this.seedService.truncate();
  }

  @Get()
  getSeedStatus() {
    return { message: 'Seed endpoint is available. Use POST to trigger seeding.' };
  }
} 