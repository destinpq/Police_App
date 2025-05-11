import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { Milestone } from './entities/milestone.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get()
  async findAll(): Promise<Milestone[]> {
    return this.milestoneService.findAll();
  }

  @Get('project/:id')
  async findByProject(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Milestone[]> {
    return this.milestoneService.findByProject(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Milestone> {
    return this.milestoneService.findOne(id);
  }

  @Post()
  async create(
    @Body() createMilestoneDto: CreateMilestoneDto,
    @Request() req: any
  ): Promise<Milestone> {
    const currentUser = req.user as User;
    return this.milestoneService.create(createMilestoneDto, currentUser);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @Request() req: any
  ): Promise<Milestone> {
    const currentUser = req.user as User;
    return this.milestoneService.update(id, updateMilestoneDto, currentUser);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    const currentUser = req.user as User;
    return this.milestoneService.remove(id, currentUser);
  }

  @Put(':id/update-status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<Milestone> {
    const currentUser = req.user as User;
    return this.milestoneService.updateMilestoneStatus(id, currentUser);
  }
} 