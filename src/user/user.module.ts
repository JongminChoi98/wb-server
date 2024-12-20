import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from '../guards/roles.guard';
import { User, UserSchema } from '../schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
    AuthModule,
  ],
  providers: [UserService, RolesGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
