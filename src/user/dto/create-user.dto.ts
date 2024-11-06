import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'Username for the user', example: 'john_doe' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'securePassword123',
  })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @ApiProperty({ description: 'Role of the user', example: 'Client' })
  @IsNotEmpty({ message: 'Role should not be empty' })
  role: string;
}
