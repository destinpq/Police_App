import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../user/entities/user.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any
  ): Promise<Project> {
    const currentUser = req.user as User;
    return this.projectService.create(createProjectDto, currentUser);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any
  ): Promise<Project> {
    const currentUser = req.user as User;
    return this.projectService.update(id, updateProjectDto, currentUser);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    const currentUser = req.user as User;
    return this.projectService.remove(id, currentUser);
  }
} 