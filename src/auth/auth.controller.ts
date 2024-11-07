import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from '../user/decorator/roles.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
@ApiTags('Auth')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiExcludeEndpoint()
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
      return await this.authService.register(createUserDto);
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const token = await this.authService.login(loginUserDto);
      if (token) {
        res.cookie('access_token', token, { httpOnly: true });
        return res.send({ access_token: token });
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @ApiExcludeEndpoint()
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

  @ApiExcludeEndpoint()
  @Roles(UserRole.Any)
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @ApiExcludeEndpoint()
  @Roles(UserRole.Any)
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req, @Res() res: Response) {
    const token = await this.authService.googleLogin(req.user);
    res.cookie('access_token', token, { httpOnly: true });
    return res.send({ access_token: token });
  }
}
