import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Role should not be empty' })
  role: string;
}
