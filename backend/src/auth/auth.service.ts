import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TecnicosService } from '../tecnicos/tecnicos.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: TecnicosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmail(email);
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
      companies: user.companies,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async changePassword(id: number, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.updateUser(id, { password: hashedPassword });
  }

  async register({ name, email, password }: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(email);
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
      companies: newUser.companies,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  generateJwtToken(user: User): string {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      companies: user.companies, // Incluye las compañías en el token
    };
    return this.jwtService.sign(payload);
  }
}
