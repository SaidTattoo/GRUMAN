import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      company: user.company,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async register({ name, email, password }: RegisterDto) {
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.createUser({
      name,
      email,
      password: hashedPassword,
      profile: 'user', // o el rol adecuado
    });
    const payload = {
      id: newUser.id,
      email: newUser.email,
      profile: newUser.profile,
      company: newUser.company,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
