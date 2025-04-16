import { Module } from '@nestjs/common';
import { DatabaseFixService } from './database-fix.service';
import { DatabaseFixController } from './database-fix.controller';

@Module({
  controllers: [DatabaseFixController],
  providers: [DatabaseFixService],
  exports: [DatabaseFixService],
})
export class DatabaseFixModule {} 