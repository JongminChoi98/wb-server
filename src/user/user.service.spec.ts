import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/schema/user.schema';
import { mockUserModel } from 'src/utils/test-mocks';
import { UserService } from './user.service';

describe('User Service', () => {
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it.todo('should update profile image for a user');
  it.todo('should throw InternalServerErrorException if profile image update fails');

  it.todo('should find a user by email');
  it.todo('should throw InternalServerErrorException if finding user by email fails');

  it.todo('should find a user by username');
  it.todo('should throw InternalServerErrorException if finding user by username fails');

  it.todo('should get all users including deleted ones');
  it.todo('should throw InternalServerErrorException if retrieving all users fails');

  it.todo('should find a user by ID');
  it.todo('should throw InternalServerErrorException if finding user by ID fails');

  it.todo('should update user information');
  it.todo('should throw InternalServerErrorException if updating user information fails');

  it.todo('should soft delete a user and change their email');
  it.todo('should throw InternalServerErrorException if soft deleting user fails');

  it.todo('should hard delete a user');
  it.todo('should throw InternalServerErrorException if hard deleting user fails');

  it.todo('should find a user by reset token');
  it.todo('should set reset token and expiry date for a user');
  it.todo('should throw InternalServerErrorException if setting reset token fails');

  it.todo('should update password for a user');
  it.todo('should throw InternalServerErrorException if updating password fails');
});
