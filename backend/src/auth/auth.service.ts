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

    /* hacer un login para tecnicos con las mismas validaciones que el login de usuarios solo que con el rut y password 
    */
    async loginTecnico(rut: string, password: string): Promise<{ token: string }> {
        const user = await this.usersService.findByRut(rut);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
        }

        // Obtener el último vehículo activo asignado
        const lastActiveVehiculo = user.vehiculoAsignaciones
            ?.filter(asig => asig.activo && !asig.odometro_fin)
            .sort((a, b) => b.fecha_utilizado.getTime() - a.fecha_utilizado.getTime())[0];

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            rut: user.rut,
            especialidades: user.especialidades,
            dev_mode: user.dev_mode,
           
            profile: user.profile,
            clients: user.clients,
        };
        console.log(payload);
        return {
            token: this.jwtService.sign(payload),
        };
    }
      
}
