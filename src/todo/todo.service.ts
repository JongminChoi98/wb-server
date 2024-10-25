import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  async findAllTodosByUser(userId: string): Promise<Todo[]> {
    try {
      return await this.todoModel.find({ user: userId }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get todos');
    }
  }

  async findTodoById(userId: string, todoId: string): Promise<Todo> {
    try {
      const todo = await this.todoModel
        .findOne({ _id: todoId, user: userId })
        .exec();
      if (!todo) {
        throw new NotFoundException('Todo not found');
      }
      return todo;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get todo');
    }
  }
}
