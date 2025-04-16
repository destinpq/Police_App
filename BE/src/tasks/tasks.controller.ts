import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll() {
    try {
      const tasks = await this.tasksService.findAll();
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error; // Let the exception filter handle the error response
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const updatedTask = await this.tasksService.update(id, updateTaskDto);
    return { 
      message: 'Task updated successfully',
      task: updatedTask 
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Return 200 instead of 204 to allow response body
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { message: 'Task deleted successfully' };
  }
} 