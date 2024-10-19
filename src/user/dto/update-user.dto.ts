import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Username should not be empty' })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password?: string;
}
