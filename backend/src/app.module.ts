import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

// ConfigModule is loaded inline since @nestjs/config may need to be added
// We handle config via dotenv directly for simplicity
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow'),
    AuthModule,
    TasksModule,
    UsersModule,
  ],
})
export class AppModule {}
