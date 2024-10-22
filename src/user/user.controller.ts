import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from './decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Roles(UserRole.Any)
  @UseGuards(RolesGuard)
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findUserByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new InternalServerErrorException('Email already exists');
      }
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  @Roles(UserRole.Any)
  @UseGuards(RolesGuard)
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const user = await this.userService.validateUser(
        loginUserDto.email,
        loginUserDto.password,
      );

      if (user) {
        const payload = {
          _id: user._id,
          username: user.username,
          role: user.role,
        };
        const token = this.jwtService.sign(payload);

        res.cookie('access_token', token, { httpOnly: true });
        return res.send({ access_token: token });
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      res.clearCookie('access_token');
      return res.send({ message: 'Logged out successfully' });
    } catch (error) {
      throw new InternalServerErrorException('Logout failed');
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      const user = await this.userService.findUserById(userId);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get profile');
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Put('edit')
  @UsePipes(new ValidationPipe())
  async editUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }

      if (updateUserDto.email) {
        const existingUserByEmail = await this.userService.findUserByEmail(
          updateUserDto.email,
        );
        if (
          existingUserByEmail &&
          existingUserByEmail._id.toString() !== userId
        ) {
          throw new InternalServerErrorException('Email already exists');
        }
      }

      if (updateUserDto.username) {
        const existingUserByUsername =
          await this.userService.findUserByUsername(updateUserDto.username);
        if (
          existingUserByUsername &&
          existingUserByUsername._id.toString() !== userId
        ) {
          throw new InternalServerErrorException('Username already exists');
        }
      }

      return await this.userService.updateUser(userId, updateUserDto);
    } catch (error) {
      if (
        error.message === 'Email already exists' ||
        error.message === 'Username already exists'
      ) {
        throw error;
      }
      throw new InternalServerErrorException('User update failed');
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Delete('delete')
  async deleteUser(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }

      await this.userService.softDeleteUser(userId);
      return { message: 'User soft deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'User deletion failed: ' + error.message,
      );
    }
  }
}
