import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { mockAuthService, mockJwtService } from 'src/utils/test-mocks';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  updateProfileImage: jest
    .fn()
    .mockImplementation((userId, profileImageUrl) => ({
      _id: userId,
      profileImageUrl,
    })),

  findUserByEmail: jest.fn().mockImplementation((email) => ({
    _id: 'userId',
    email,
    isDeleted: false,
  })),

  findUserByUsername: jest.fn().mockImplementation((username) => ({
    _id: 'userId',
    username,
    isDeleted: false,
  })),

  getAllUsersIncludeDelete: jest.fn().mockResolvedValue([
    { _id: 'userId1', email: 'user1@example.com' },
    { _id: 'userId2', email: 'user2@example.com', isDeleted: true },
  ]),

  findUserById: jest.fn().mockImplementation((userId) => ({
    _id: userId,
    isDeleted: false,
  })),

  updateUser: jest.fn().mockImplementation((userId, updateUserDto) => ({
    _id: userId,
    ...updateUserDto,
  })),

  softDeleteUser: jest.fn().mockResolvedValue(undefined),

  hardDeleteUser: jest.fn().mockResolvedValue(undefined),

  findUserByResetToken: jest.fn().mockImplementation((resetToken) => ({
    _id: 'userId',
    resetToken,
  })),

  setResetToken: jest.fn().mockResolvedValue(undefined),

  updatePassword: jest.fn().mockResolvedValue(undefined),
};

describe('UserController', () => {
  let userController: UserController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
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

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it.todo(
    'should retrieve user profile successfully for an authenticated user',
  );
  it.todo(
    'should throw UnauthorizedException when retrieving profile without a valid user',
  );

  it.todo('should update user profile successfully for an authenticated user');
  it.todo(
    'should throw InternalServerErrorException if email already exists during update',
  );

  it.todo(
    'should throw InternalServerErrorException if username already exists during update',
  );
  it.todo(
    'should throw UnauthorizedException when updating profile without a valid user',
  );

  it.todo('should soft delete user profile successfully');
  it.todo(
    'should throw UnauthorizedException when deleting profile without a valid user',
  );

  it.todo('should update profile image successfully for an authenticated user');
  it.todo(
    'should throw UnauthorizedException when updating profile image without a valid user',
  );
});
