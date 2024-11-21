import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserProfile } from '../enums/enums/user-profile.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserProfile)
  profile: UserProfile;
}