import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  async findAll() {
    console.log("GET /departments - Fetching all departments");
    try {
      const departments = await this.departmentsService.findAll();
      console.log(`Found ${departments.length} departments:`, departments);
      return departments;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    const updatedDepartment = await this.departmentsService.update(id, updateDepartmentDto);
    return { 
      message: 'Department updated successfully',
      department: updatedDepartment 
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(id);
    return { message: 'Department deleted successfully' };
  }
} 