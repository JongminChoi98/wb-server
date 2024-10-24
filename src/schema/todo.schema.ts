import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Todo extends Document {
  @Prop({ type: String, required: false })
  content?: string;

  @Prop({ type: Date, required: false })
  dueDate?: Date;

  @Prop({ type: String, ref: User.name, required: true })
  user: string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
