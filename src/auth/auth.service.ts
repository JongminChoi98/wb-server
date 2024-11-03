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

  async login(loginUserDto: LoginUserDto): Promise<string | null> {
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
      return this.jwtService.sign(payload);
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async googleLogin(user: any): Promise<string> {
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
    return this.jwtService.sign(payload);
  }
}
