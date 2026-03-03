import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
const TaskModel = mongoose.model('Task', TaskSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
  console.log('🌱 Seeding database...');

  await UserModel.deleteMany({});
  await TaskModel.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await UserModel.create({
    name: 'Admin User',
    email: 'admin@taskflow.com',
    password: adminPassword,
    role: 'admin',
  });

  const member1 = await UserModel.create({
    name: 'Alice Johnson',
    email: 'alice@taskflow.com',
    password: memberPassword,
    role: 'member',
  });

  const member2 = await UserModel.create({
    name: 'Bob Smith',
    email: 'bob@taskflow.com',
    password: memberPassword,
    role: 'member',
  });

  // Seed tasks
  await TaskModel.insertMany([
    {
      title: 'Setup project infrastructure',
      description: 'Initialize repositories, CI/CD pipelines, and cloud environments.',
      status: 'done',
      priority: 'high',
      dueDate: new Date('2025-01-15'),
      owner: admin._id,
      assignedTo: member1._id,
    },
    {
      title: 'Design database schema',
      description: 'Model all entities and relationships for the MongoDB collections.',
      status: 'done',
      priority: 'high',
      dueDate: new Date('2025-01-20'),
      owner: admin._id,
      assignedTo: member1._id,
    },
    {
      title: 'Implement authentication flow',
      description: 'JWT-based auth with register, login, and protected routes.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2025-02-01'),
      owner: member1._id,
      assignedTo: member1._id,
    },
    {
      title: 'Build task CRUD API',
      description: 'NestJS controllers and services for task management with full RBAC.',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date('2025-02-10'),
      owner: member2._id,
      assignedTo: member2._id,
    },
    {
      title: 'Create frontend dashboard',
      description: 'Next.js dashboard with task list, filters, and create/edit modals.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2025-02-20'),
      owner: admin._id,
      assignedTo: member2._id,
    },
    {
      title: 'Write unit tests',
      description: 'Jest tests for all NestJS services and key utility functions.',
      status: 'todo',
      priority: 'low',
      dueDate: new Date('2025-03-01'),
      owner: member1._id,
    },
    {
      title: 'Deploy to production',
      description: 'Set up Railway backend and Vercel frontend with environment configs.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2025-03-15'),
      owner: admin._id,
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin  → admin@taskflow.com / admin123');
  console.log('  Alice  → alice@taskflow.com / member123');
  console.log('  Bob    → bob@taskflow.com / member123');

  await mongoose.disconnect();
}

seed().catch(console.error);
