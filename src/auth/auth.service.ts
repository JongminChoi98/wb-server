import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('User validation failed');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new InternalServerErrorException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (user) {
      const payload = {
        _id: user._id,
        username: user.username,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      user.refreshToken = refreshToken;
      await user.save();

      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async googleLogin(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let existingUser = await this.userService.findUserByEmail(user.email);

      if (!existingUser) {
        const createUserDto: CreateUserDto = {
          email: user.email,
          username: user.username,
          password: '',
          role: 'Client',
        };

        try {
          existingUser = await this.register(createUserDto);
        } catch (error) {
          throw new InternalServerErrorException(
            'Failed to create user during Google login',
          );
        }
      }

      if (!existingUser) {
        throw new InternalServerErrorException(
          'User could not be created or found',
        );
      }

      const payload = {
        _id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      existingUser.refreshToken = refreshToken;
      await existingUser.save();

      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userModel
        .findOne({ _id: decoded._id, refreshToken })
        .exec();

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = {
        _id: user._id,
        username: user.username,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });
      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException('Could not refresh access token');
    }
  }

  generateResetToken(userId: string): string {
    try {
      return this.jwtService.sign(
        { userId },
        {
          secret: process.env.JWT_RESET_SECRET,
          expiresIn: '1h',
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate reset token');
    }
  }

  verifyResetToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_SECRET,
      });
      return payload.userId;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = this.verifyResetToken(token);
    await this.userService.updatePassword(userId, newPassword);
  }
}
