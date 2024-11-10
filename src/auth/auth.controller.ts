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
      throw new InternalServerErrorException(
        'User registration failed: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginUserDto);
      if (accessToken && refreshToken) {
        res.cookie('access_token', accessToken, { httpOnly: true });
        res.cookie('refresh_token', refreshToken, { httpOnly: true });
        return res.send({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }

  @ApiExcludeEndpoint()
  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.send({ message: 'Logged out successfully' });
    } catch (error) {
      throw new InternalServerErrorException('Logout failed: ' + error.message);
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
    try {
      const { accessToken, refreshToken } = await this.authService.googleLogin(
        req.user,
      );
      res.cookie('access_token', accessToken, { httpOnly: true });
      res.cookie('refresh_token', refreshToken, { httpOnly: true });
      return res.send({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Faild to redirect: ' + error.message,
      );
    }
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    try {
      const newAccessToken =
        await this.authService.refreshAccessToken(refreshToken);
      res.cookie('access_token', newAccessToken, { httpOnly: true });
      return res.send({ access_token: newAccessToken });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
