import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
