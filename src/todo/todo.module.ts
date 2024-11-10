import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Todo, TodoSchema } from 'src/schema/todo.schema';
import { RolesGuard } from '../guards/roles.guard';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
    AuthModule,
  ],

  providers: [TodoService, RolesGuard],
  controllers: [TodoController],
})
export class TodoModule {}
