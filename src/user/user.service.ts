import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
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

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ username }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by username');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all users');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('User validation failed');
    }
  }

  async findUserById(userId: string): Promise<User | undefined> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }
}
