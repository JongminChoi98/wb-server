import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../user/decorator/roles.decorator';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: String, required: false, default: null })
  profileImageUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
