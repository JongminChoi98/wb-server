import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from '../user/decorator/roles.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoService } from './todo.service';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }

      const todoData = {
        content: createTodoDto.content ?? null,
        dueDate: createTodoDto.dueDate ?? null,
      };

      return await this.todoService.createTodo(userId, todoData);
    } catch (error) {
      throw new InternalServerErrorException(
        'Todo creation failed: ' + error.message,
      );
    }
  }
}
