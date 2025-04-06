import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async seed() {
    return this.seedService.seed();
  }

  @Post('truncate')
  @HttpCode(HttpStatus.OK)
  async truncate() {
    return this.seedService.truncate();
  }
} 