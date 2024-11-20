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
    jest.clearAllMocks();
  });

  it('should update profile image for a user', async () => {
    const userId = 'userId';
    const profileImageUrl = 'http://example.com/profile.jpg';

    const result = await userService.updateProfileImage(userId, profileImageUrl);

    expect(result).toEqual({
      _id: userId,
      profileImageUrl,
    });

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { profileImageUrl }, { new: true });
  });

  it('should throw InternalServerErrorException if profile image update fails', async () => {
    const userId = 'userId';
    const profileImageUrl = 'http://example.com/profile.jpg';

    mockUserModel.findByIdAndUpdate.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(userService.updateProfileImage(userId, profileImageUrl)).rejects.toThrow('Failed to update profile image');
  });

  it('should find a user by email', async () => {
    const email = 'user@example.com';

    const result = await userService.findUserByEmail(email);

    expect(result).toEqual({
      _id: 'userId',
      email,
      isDeleted: false,
    });
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email, isDeleted: false });
  });

  it('should throw InternalServerErrorException if finding user by email fails', async () => {
    const email = 'user@example.com';

    mockUserModel.findOne.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(userService.findUserByEmail(email)).rejects.toThrow('Failed to find user by email');
  });

  it('should find a user by username', async () => {
    const username = 'testuser';

    const result = await userService.findUserByUsername(username);

    expect(result).toEqual({
      _id: 'userId',
      username,
      isDeleted: false,
    });
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ username, isDeleted: false });
  });

  it('should throw InternalServerErrorException if finding user by username fails', async () => {
    const username = 'testuser';

    mockUserModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.findUserByUsername(username)).rejects.toThrow('Failed to find user by username');
  });

  it('should get all users including deleted ones', async () => {
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: 'userId1', email: 'user1@example.com', isDeleted: false },
        { _id: 'userId2', email: 'user2@example.com', isDeleted: true },
      ]),
    });

    const result = await userService.getAllUsersIncludeDelete();

    expect(result).toEqual([
      { _id: 'userId1', email: 'user1@example.com', isDeleted: false },
      { _id: 'userId2', email: 'user2@example.com', isDeleted: true },
    ]);
    expect(mockUserModel.find).toHaveBeenCalledWith();
  });
  it('should throw InternalServerErrorException if retrieving all users fails', async () => {
    mockUserModel.find.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.getAllUsersIncludeDelete()).rejects.toThrow('Failed to get all users');
  });

  it('should find a user by ID', async () => {
    const userId = 'userId';

    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: userId,
        email: 'user@example.com',
        isDeleted: false,
      }),
    });

    const result = await userService.findUserById(userId);

    expect(result).toEqual({
      _id: userId,
      email: 'user@example.com',
      isDeleted: false,
    });
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ _id: userId, isDeleted: false });
  });

  it('should throw InternalServerErrorException if finding user by ID fails', async () => {
    const userId = 'userId';

    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.findUserById(userId)).rejects.toThrow('Failed to find user by ID');
  });

  it('should update user information', async () => {
    const userId = 'userId';
    const updateUserDto = {
      username: 'newUsername',
      email: 'newEmail@example.com',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: userId,
        username: updateUserDto.username,
        email: updateUserDto.email,
      }),
    });

    const result = await userService.updateUser(userId, updateUserDto);

    expect(result).toEqual({
      _id: userId,
      username: 'newUsername',
      email: 'newEmail@example.com',
    });
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateUserDto, { new: true });
  });

  it('should throw InternalServerErrorException if updating user information fails', async () => {
    const userId = 'userId';
    const updateUserDto = {
      username: 'newUsername',
      email: 'newEmail@example.com',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.updateUser(userId, updateUserDto)).rejects.toThrow('Failed to update user');
  });

  it('should soft delete a user and change their email', async () => {
    const userId = 'userId';
    const randomEmail = expect.stringMatching(/^deleted_[a-f0-9-]+@wb-deleted\.com$/);

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: userId,
        isDeleted: true,
        email: randomEmail,
      }),
    });

    await userService.softDeleteUser(userId);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        isDeleted: true,
        email: randomEmail,
      }),
    );
  });

  it('should throw InternalServerErrorException if soft deleting user fails', async () => {
    const userId = 'userId';

    mockUserModel.findByIdAndUpdate.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.softDeleteUser(userId)).rejects.toThrow('Failed to delete user');
  });

  it('should hard delete a user', async () => {
    const userId = 'userId';

    mockUserModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await userService.hardDeleteUser(userId);

    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it('should throw InternalServerErrorException if hard deleting user fails', async () => {
    const userId = 'userId';

    mockUserModel.findByIdAndDelete.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(userService.hardDeleteUser(userId)).rejects.toThrow('Failed to delete user');
  });

  it.todo('should find a user by reset token');
  it('should set reset token and expiry date for a user', async () => {
    const userId = 'userId';
    const resetToken = 'resetToken';
    const expiryDate = new Date();

    mockUserModel.findByIdAndUpdate.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue({
        _id: userId,
        resetToken,
        resetTokenExpiry: expiryDate,
      }),
    });

    await userService.setResetToken(userId, resetToken, expiryDate);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      resetToken,
      resetTokenExpiry: expiryDate,
    });
  });
  it.todo('should throw InternalServerErrorException if setting reset token fails');

  it.todo('should update password for a user');
  it.todo('should throw InternalServerErrorException if updating password fails');
});
