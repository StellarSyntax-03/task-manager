import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/schemas/user.schema';
import { Types } from 'mongoose';

const mockTaskModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const adminUser = { id: new Types.ObjectId().toString(), role: UserRole.ADMIN };
const memberUser = { id: new Types.ObjectId().toString(), role: UserRole.MEMBER };

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: {
            ...mockTaskModel,
            constructor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(service['taskModel'], 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      } as any);

      await expect(service.findOne('nonexistent-id', adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should allow admin to access any task', async () => {
      const otherId = new Types.ObjectId();
      const mockTask = {
        _id: new Types.ObjectId(),
        title: 'Test Task',
        owner: otherId,
        assignedTo: null,
        toString: () => otherId.toString(),
      };
      mockTask.owner.toString = () => otherId.toString();

      jest.spyOn(service['taskModel'], 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTask) }),
      } as any);

      const result = await service.findOne(mockTask._id.toString(), adminUser);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when member accesses another users task', async () => {
      const otherId = new Types.ObjectId();
      const mockTask = {
        _id: new Types.ObjectId(),
        title: 'Test Task',
        owner: { toString: () => otherId.toString() },
        assignedTo: null,
      };

      jest.spyOn(service['taskModel'], 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTask) }),
      } as any);

      await expect(service.findOne(mockTask._id.toString(), memberUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      jest.spyOn(service['taskModel'], 'countDocuments')
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const stats = await service.getStats(adminUser);
      expect(stats).toEqual({ total: 10, todo: 3, inProgress: 4, done: 3, highPriority: 2 });
    });
  });
});
