import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from '../schema/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async createTodo(
    userId: string,
    createTodoDto: CreateTodoDto,
  ): Promise<Todo> {
    try {
      const newTodo = new this.todoModel({ ...createTodoDto, user: userId });
      return await newTodo.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create todo');
    }
  }
}
