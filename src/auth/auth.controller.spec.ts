import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import {
  mockAuthService,
  mockJwtService,
  mockMailService,
  mockUserService,
} from 'src/utils/test-mocks';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it.todo('should register a new user successfully');
  it.todo(
    'should throw InternalServerErrorException if email already exists during registration',
  );
  it.todo(
    'should throw InternalServerErrorException if user registration fails',
  );

  it.todo('should login a user and set access and refresh tokens in cookies');
  it.todo(
    'should throw UnauthorizedException if login credentials are invalid',
  );

  it.todo(
    'should logout a user and clear access and refresh tokens from cookies',
  );

  it.todo('should initiate Google login process');

  it.todo(
    'should handle Google login redirect and set access and refresh tokens in cookies',
  );
  it.todo(
    'should throw InternalServerErrorException if Google login redirect fails',
  );

  it.todo('should refresh access token with a valid refresh token');
  it.todo(
    'should throw UnauthorizedException if refresh token is invalid or expired',
  );

  it.todo('should send password reset link via email for a valid user');
  it.todo(
    'should throw NotFoundException if email is not found during password reset request',
  );
  it.todo(
    'should throw InternalServerErrorException if password reset request processing fails',
  );

  it.todo('should reset password with a valid reset token and new password');
  it.todo(
    'should throw BadRequestException if reset token or new password is missing',
  );
  it.todo('should throw InternalServerErrorException if password reset fails');
});
