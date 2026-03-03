import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, FilterTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() dto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query() filter: FilterTaskDto) {
    return this.tasksService.findAll(req.user, filter);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.tasksService.getStats(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user);
  }
}
