import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/user/decorator/roles.decorator';

export const mockJwtService = {
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'validAccessToken') {
      return { _id: 'userId', role: UserRole.Client };
    } else if (token === 'expiredAccessToken') {
      const error = new Error('TokenExpiredError');
      error.name = 'TokenExpiredError';
      throw error;
    } else {
      throw new Error('Invalid token');
    }
  }),
};

export const mockAuthService = {
  register: jest.fn().mockImplementation((createUserDto) => ({
    _id: 'newUserId',
    ...createUserDto,
  })),
  login: jest.fn().mockImplementation((loginUserDto) => ({
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  })),
  googleLogin: jest.fn().mockResolvedValue({
    accessToken: 'mockGoogleAccessToken',
    refreshToken: 'mockGoogleRefreshToken',
  }),
  refreshAccessToken: jest.fn().mockImplementation((refreshToken) => {
    if (refreshToken === 'validRefreshToken') {
      return Promise.resolve('newAccessToken');
    }
    throw new UnauthorizedException('Invalid or expired refresh token');
  }),
  generateResetToken: jest.fn().mockReturnValue('mockResetToken'),
  resetPassword: jest.fn().mockResolvedValue(undefined),
};

export const mockUserService = {
  findUserByEmail: jest.fn().mockImplementation((email) => {
    if (email === 'existing@example.com') {
      return Promise.resolve({
        _id: 'existingUserId',
        email,
        password: 'hashedPassword',
        username: 'existingUser',
        role: 'Client',
        save: jest.fn(),
      });
    }
    return Promise.resolve(null);
  }),

  updatePassword: jest.fn().mockResolvedValue(undefined),
};

export const mockMailService = {
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

export const mockTodoModel = {
  create: jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  })),
  find: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  findOne: jest.fn().mockReturnThis(),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  findOneAndUpdate: jest.fn().mockReturnThis(),
};

export const mockUserModel = {
  findByIdAndUpdate: jest.fn().mockImplementation((userId, updateData) => {
    if (updateData.resetToken) {
      return {
        exec: jest.fn().mockResolvedValue({
          _id: userId,
          ...updateData,
        }),
      };
    }
    return {
      exec: jest.fn().mockResolvedValue({
        _id: userId,
        profileImageUrl: 'http://example.com/profile.jpg',
      }),
    };
  }),
  findOne: jest.fn().mockImplementation((query) => {
    if (query.resetToken) {
      return {
        exec: jest.fn().mockResolvedValue({
          _id: 'userId',
          resetToken: query.resetToken,
        }),
      };
    } else if (query.email) {
      return {
        exec: jest.fn().mockResolvedValue({
          _id: 'userId',
          email: query.email,
          isDeleted: false,
        }),
      };
    } else if (query.username) {
      return {
        exec: jest.fn().mockResolvedValue({
          _id: 'userId',
          username: query.username,
          isDeleted: false,
        }),
      };
    }
    return {
      exec: jest.fn().mockResolvedValue(null),
    };
  }),
  find: jest.fn().mockResolvedValue([
    { _id: 'userId1', email: 'user1@example.com' },
    { _id: 'userId2', email: 'user2@example.com', isDeleted: true },
  ]),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn(),
};
