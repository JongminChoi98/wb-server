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
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from './decorator/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiOperation({ summary: 'Edit user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiOperation({ summary: 'Update profile image' })
  @ApiResponse({
    status: 200,
    description: 'Profile image updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
