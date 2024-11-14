import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Todo } from 'src/schema/todo.schema';
import { mockTodoModel } from 'src/utils/test-mocks';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let todoService: TodoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
  });

  it.todo('should create a new todo for a user');
  it.todo('should throw InternalServerErrorException if creating todo fails');

  it.todo('should retrieve all todos for a specific user');
  it.todo(
    'should throw InternalServerErrorException if retrieving todos fails',
  );

  it.todo('should retrieve a specific todo by ID for a user');
  it.todo('should throw NotFoundException if the todo is not found by ID');
  it.todo(
    'should throw InternalServerErrorException if retrieving todo by ID fails',
  );

  it.todo('should delete a specific todo by ID for a user');
  it.todo('should throw NotFoundException if the todo to delete is not found');
  it.todo('should throw InternalServerErrorException if deleting todo fails');

  it.todo('should update a specific todo by ID for a user');
  it.todo('should throw NotFoundException if the todo to update is not found');
  it.todo('should throw InternalServerErrorException if updating todo fails');
});
