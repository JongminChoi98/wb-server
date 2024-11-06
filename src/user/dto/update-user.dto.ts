import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Username for the user',
    example: 'joey_min',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Username should not be empty' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Password for the user',
    example: 'securePassword123',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Profile image URL must be a string' })
  profileImageUrl?: string;
}
