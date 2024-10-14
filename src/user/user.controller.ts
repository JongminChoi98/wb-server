import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { RolesGuard } from './roles.guard';
import { Roles, UserRole } from './decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
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
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Roles(UserRole.Any)
  @UseGuards(RolesGuard)
  @Post('login')
  async login(@Body() loginUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    if (user) {
      const payload = {
        username: user.username,
        sub: user._id,
        role: user.role,
      };
      const token = this.jwtService.sign(payload);

      res.cookie('access_token', token, { httpOnly: true });
      return res.send({ access_token: token });
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.send({ message: 'Logged out successfully' });
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Get('profile')
  async getProfile() {
    return 'User profile information';
  }

  @Roles(UserRole.Any)
  @UseGuards(RolesGuard)
  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
