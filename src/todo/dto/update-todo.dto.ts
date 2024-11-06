import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Updated content of the todo',
    example: 'Learn advanced React Native',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated due date of the todo in ISO 8601 format',
    example: '2024-11-15T15:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
