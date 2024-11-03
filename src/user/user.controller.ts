import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from './decorator/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Put('profile-image')
  @UsePipes(new ValidationPipe())
  async updateProfileImage(
    @Body('profileImageUrl') profileImageUrl: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      return await this.userService.updateProfileImage(userId, profileImageUrl);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update profile image: ' + error.message,
      );
    }
  }
}
