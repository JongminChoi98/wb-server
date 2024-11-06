import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiPropertyOptional({
    description: 'Content of the todo',
    example: 'Learn NestJS',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Due date of the todo in ISO 8601 format',
    example: '2024-11-10T12:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
