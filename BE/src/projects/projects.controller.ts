import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';
import { TasksService } from '../tasks/tasks.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/tasks')
  findProjectTasks(@Param('id') id: string): Promise<Task[]> {
    return this.tasksService.findByProject(id);
  }

  @Get(':id/stats')
  getProjectWithStats(@Param('id') id: string) {
    return this.projectsService.getProjectWithTaskStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Query('id') queryId: string) {
    // We accept id in both the URL and as a query param for flexibility
    return this.projectsService.update(id || queryId, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Return 200 instead of 204 to allow response body
  async remove(@Param('id') id: string, @Query('id') queryId: string) {
    // We accept id in both the URL and as a query param for flexibility
    await this.projectsService.remove(id || queryId);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/team/:userId')
  async addTeamMember(@Param('id') projectId: string, @Param('userId') userId: string) {
    await this.projectsService.addTeamMember(projectId, userId);
    return { message: 'Team member added to project successfully' };
  }

  @Delete(':id/team/:userId')
  async removeTeamMember(@Param('id') projectId: string, @Param('userId') userId: string) {
    await this.projectsService.removeTeamMember(projectId, userId);
    return { message: 'Team member removed from project successfully' };
  }

  @Get(':id/team')
  async getProjectTeam(@Param('id') projectId: string) {
    return this.projectsService.getProjectTeam(projectId);
  }
} 