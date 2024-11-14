import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { mockJwtService, mockUserModel, mockUserService } from 'src/utils/test-mocks';
import { AuthService } from './auth.service';

describe('Auth Service', () => {
  let authServce: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    authServce = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authServce).toBeDefined();
  });

  it.todo('should validate a user with correct email and password');
  it.todo('should return null if user validation fails with incorrect email or password');
  it.todo('should throw InternalServerErrorException if user validation encounters an error');

  it.todo('should register a new user with hashed password');
  it.todo('should throw InternalServerErrorException if email already exists during registration');
  it.todo('should throw InternalServerErrorException if user registration fails');

  it.todo('should login a user and return access and refresh tokens');
  it.todo('should throw UnauthorizedException if login credentials are invalid');

  it.todo('should handle Google login by creating a new user if not existing');
  it.todo('should return access and refresh tokens for Google login');
  it.todo('should throw InternalServerErrorException if Google login fails to create user');

  it.todo('should refresh access token with a valid refresh token');
  it.todo('should throw UnauthorizedException if refresh token is invalid or expired');

  it.todo('should generate a reset token for password reset');
  it.todo('should throw InternalServerErrorException if reset token generation fails');

  it.todo('should verify a valid reset token and return userId');
  it.todo('should throw UnauthorizedException if reset token is invalid or expired');

  it.todo('should reset user password if reset token is valid');
  it.todo('should throw UnauthorizedException if reset token for password reset is invalid');
});
