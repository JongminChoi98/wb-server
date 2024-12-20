import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateProfileImage(userId: string, profileImageUrl: string): Promise<User> {
    try {
      return await this.userModel.findByIdAndUpdate(userId, { profileImageUrl }, { new: true }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update profile image');
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ email, isDeleted: false }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ username, isDeleted: false }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by username');
    }
  }

  async getAllUsersIncludeDelete(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all users');
    }
  }

  async findUserById(userId: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ _id: userId, isDeleted: false }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password) {
        const saltRounds = 10;
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
      }
      return await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async softDeleteUser(userId: string): Promise<void> {
    try {
      const randomEmail = `deleted_${uuidv4()}@wb-deleted.com`;
      await this.userModel.findByIdAndUpdate(userId, { isDeleted: true, email: randomEmail }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async hardDeleteUser(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndDelete(userId).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async findUserByResetToken(resetToken: string): Promise<User | null> {
    return this.userModel.findOne({ resetToken });
  }

  async setResetToken(userId: string, token: string, expiryDate: Date): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        resetToken: token,
        resetTokenExpiry: expiryDate,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to set reset token');
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update password');
    }
  }
}
