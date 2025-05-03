import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Request() req: any): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findAll(currentUser);
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: 'OPEN' | 'IN_PROGRESS' | 'DONE',
    @Request() req: any
  ): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findByStatus(status, currentUser);
  }

  @Get('assignee/:id')
  async findByAssignee(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findByAssignee(id, currentUser);
  }

  @Get('project/:id')
  async findByProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findByProject(id, currentUser);
  }

  @Get('overdue')
  async findOverdue(@Request() req: any): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findOverdueTasks(currentUser);
  }

  @Get('my-tasks')
  async findMyTasks(@Request() req: any): Promise<Task[]> {
    const currentUser = req.user as User;
    return this.tasksService.findByAssignee(currentUser.id, currentUser);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<Task> {
    const currentUser = req.user as User;
    return this.tasksService.findOne(id, currentUser);
  }

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any
  ): Promise<Task> {
    const currentUser = req.user as User;
    return this.tasksService.create(createTaskDto, currentUser);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any
  ): Promise<Task> {
    const currentUser = req.user as User;
    return this.tasksService.update(id, updateTaskDto, currentUser);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    const currentUser = req.user as User;
    return this.tasksService.remove(id, currentUser);
  }
}
