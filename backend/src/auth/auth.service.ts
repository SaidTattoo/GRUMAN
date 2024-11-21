import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {

    constructor(private usersService: UsersService,private readonly jwtService: JwtService) {}
   
   
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail( email.toLowerCase()  );
        if (user && (await bcrypt.compare(password, user.password))) {
          return user;
        }
        return null;
    }
    async login({ email, password }) {
        const user = await this.usersService.findByEmail(email.toLowerCase());
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
          clients: user.clients,
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
          clients: user.clients,
        };
        return this.jwtService.sign(payload);
      }

      decodeJwtToken(token: string): any {
        try {
          return this.jwtService.decode(token); // Solo decodifica el payload del token
        } catch (error) {
          throw new Error('Failed to decode token: ' + error.message);
        }
      }
}
