import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto, FilterTaskDto } from './dto/task.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(dto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...dto,
      owner: new Types.ObjectId(userId),
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : null,
    });
    return (await task.save()).populate('owner assignedTo', 'name email role');
  }

  async findAll(
    user: { id: string; role: UserRole },
    filter: FilterTaskDto,
  ): Promise<TaskDocument[]> {
    const query: any = {};

    // Members can only see their own tasks
    if (user.role === UserRole.MEMBER) {
      query.$or = [
        { owner: new Types.ObjectId(user.id) },
        { assignedTo: new Types.ObjectId(user.id) },
      ];
    }

    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;

    const sortField = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    return this.taskModel
      .find(query)
      .sort({ [sortField]: sortOrder })
      .populate('owner assignedTo', 'name email role')
      .exec();
  }

  async findOne(id: string, user: { id: string; role: UserRole }): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('owner assignedTo', 'name email role')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    this.checkAccess(task, user);
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    user: { id: string; role: UserRole },
  ): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    this.checkAccess(task, user);

    const updateData: any = { ...dto };
    if (dto.assignedTo) updateData.assignedTo = new Types.ObjectId(dto.assignedTo);

    const updated = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner assignedTo', 'name email role')
      .exec();

    return updated;
  }

  async remove(id: string, user: { id: string; role: UserRole }): Promise<void> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    this.checkAccess(task, user);
    await this.taskModel.findByIdAndDelete(id).exec();
  }

  async getStats(user: { id: string; role: UserRole }) {
    const query: any =
      user.role === UserRole.MEMBER
        ? { $or: [{ owner: new Types.ObjectId(user.id) }, { assignedTo: new Types.ObjectId(user.id) }] }
        : {};

    const [total, todo, inProgress, done, highPriority] = await Promise.all([
      this.taskModel.countDocuments(query),
      this.taskModel.countDocuments({ ...query, status: 'todo' }),
      this.taskModel.countDocuments({ ...query, status: 'in_progress' }),
      this.taskModel.countDocuments({ ...query, status: 'done' }),
      this.taskModel.countDocuments({ ...query, priority: 'high' }),
    ]);

    return { total, todo, inProgress, done, highPriority };
  }

  private checkAccess(task: TaskDocument, user: { id: string; role: UserRole }) {
    if (user.role === UserRole.ADMIN) return;
    const ownerId = task.owner?.toString();
    const assignedId = task.assignedTo?.toString();
    if (ownerId !== user.id && assignedId !== user.id) {
      throw new ForbiddenException('You do not have access to this task');
    }
  }
}
