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
      return await newUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<string | null> {
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
      return this.jwtService.sign(payload);
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
