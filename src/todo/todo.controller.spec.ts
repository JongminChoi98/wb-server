import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { mockAuthService, mockJwtService } from 'src/utils/test-mocks';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

const mockTodoService = {
  createTodo: jest.fn().mockImplementation((userId, todoData) => ({
    _id: 'mockTodoId',
    user: userId,
    ...todoData,
  })),
  findAllTodosByUser: jest.fn().mockImplementation((userId) => [
    {
      _id: 'mockTodoId1',
      user: userId,
      content: 'Test content 1',
      dueDate: new Date(),
    },
    {
      _id: 'mockTodoId2',
      user: userId,
      content: 'Test content 2',
      dueDate: new Date(),
    },
  ]),
  findTodoById: jest.fn().mockImplementation((userId, todoId) => ({
    _id: todoId,
    user: userId,
    content: 'Test content',
    dueDate: new Date(),
  })),
  deleteTodoById: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  updateTodoById: jest.fn().mockImplementation((userId, todoId, updateTodoDto) => ({
    _id: todoId,
    user: userId,
    ...updateTodoDto,
  })),
};

describe('TodoController', () => {
  let todoController: TodoController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(todoController).toBeDefined();
  });

  it.todo('should create a new todo for an authenticated user');
  it.todo('should throw UnauthorizedException when creating a todo without a valid user');

  it.todo('should get all todos for an authenticated user');
  it.todo('should throw UnauthorizedException when getting todos without a valid user');

  it.todo('should get a specific todo by ID for an authenticated user');
  it.todo('should throw UnauthorizedException when getting a todo without a valid user');
  it.todo('should throw NotFoundException if the todo is not found by ID');

  it.todo('should delete a specific todo by ID for an authenticated user');
  it.todo('should throw UnauthorizedException when deleting a todo without a valid user');
  it.todo('should throw NotFoundException if the todo to delete is not found');

  it.todo('should update a specific todo by ID for an authenticated user');
  it.todo('should throw UnauthorizedException when updating a todo without a valid user');
  it.todo('should throw NotFoundException if the todo to update is not found');
});
