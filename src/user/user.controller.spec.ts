import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { mockAuthService, mockJwtService } from 'src/utils/test-mocks';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  updateProfileImage: jest.fn().mockImplementation((userId, profileImageUrl) => ({
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

  it('should retrieve user profile successfully for an authenticated user', async () => {
    const mockUserId = 'userId';
    const mockUser = {
      _id: mockUserId,
      email: 'user@example.com',
      isDeleted: false,
    };

    const req = { user: { _id: mockUserId } } as any;

    mockUserService.findUserById.mockResolvedValueOnce(mockUser);

    const result = await userController.getProfile(req);

    expect(mockUserService.findUserById).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual(mockUser);
  });

  it('should throw UnauthorizedException when retrieving profile without a valid user', async () => {
    const req = { user: null } as any;

    await expect(userController.getProfile(req)).rejects.toThrow(new UnauthorizedException('Failed to get profile: Invalid user'));
  });

  it('should update user profile successfully for an authenticated user', async () => {
    const mockUserId = 'userId';
    const updateUserDto = { email: 'newemail@example.com' };
    const updatedUser = {
      _id: mockUserId,
      email: 'newemail@example.com',
    };

    const req = { user: { _id: mockUserId } } as any;

    mockUserService.updateUser.mockResolvedValueOnce(updatedUser);

    const result = await userController.editUser(updateUserDto, req);

    expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUserId, updateUserDto);
    expect(result).toEqual(updatedUser);
  });

  it('should throw InternalServerErrorException if email already exists during update', async () => {
    const mockUserId = 'userId';
    const updateUserDto = { email: 'existing@example.com' };

    const req = { user: { _id: mockUserId } } as any;

    const existingUser = {
      _id: 'anotherUserId',
      email: 'existing@example.com',
    };

    mockUserService.findUserByEmail.mockResolvedValueOnce(existingUser);

    await expect(userController.editUser(updateUserDto, req)).rejects.toThrow('Email already exists');
  });

  it('should throw InternalServerErrorException if username already exists during update', async () => {
    const mockUserId = 'userId';
    const updateUserDto = { username: 'existingUser' };

    const req = { user: { _id: mockUserId } } as any;

    const existingUser = {
      _id: 'anotherUserId',
      username: 'existingUser',
    };

    mockUserService.findUserByUsername.mockResolvedValueOnce(existingUser);

    await expect(userController.editUser(updateUserDto, req)).rejects.toThrow('Username already exists');
  });

  it('should throw UnauthorizedException when updating profile without a valid user', async () => {
    const updateUserDto = { email: 'newemail@example.com' };

    const req = { user: null } as any;

    await expect(userController.editUser(updateUserDto, req)).rejects.toThrow(new UnauthorizedException('User update failed: Invalid user'));
  });

  it('should soft delete user profile successfully', async () => {
    const mockUserId = 'userId';

    const req = { user: { _id: mockUserId } } as any;

    const result = await userController.deleteUser(req);

    expect(mockUserService.softDeleteUser).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual({ message: 'User soft deleted successfully' });
  });

  it('should throw UnauthorizedException when deleting profile without a valid user', async () => {
    const req = { user: null } as any;

    await expect(userController.deleteUser(req)).rejects.toThrow(new UnauthorizedException('User deletion failed: Invalid user'));
  });

  it('should update profile image successfully for an authenticated user', async () => {
    const mockUserId = 'userId';
    const profileImageUrl = 'http://example.com/image.jpg';
    const updatedUser = {
      _id: mockUserId,
      profileImageUrl,
    };

    const req = { user: { _id: mockUserId } } as any;

    mockUserService.updateProfileImage.mockResolvedValueOnce(updatedUser);

    const result = await userController.updateProfileImage(profileImageUrl, req);

    expect(mockUserService.updateProfileImage).toHaveBeenCalledWith(mockUserId, profileImageUrl);
    expect(result).toEqual(updatedUser);
  });

  it('should throw UnauthorizedException when updating profile image without a valid user', async () => {
    const profileImageUrl = 'http://example.com/image.jpg';
    const req = { user: null } as any;

    await expect(userController.updateProfileImage(profileImageUrl, req)).rejects.toThrow(new UnauthorizedException('Failed to update profile image: Invalid user'));
  });
});
