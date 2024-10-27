import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
