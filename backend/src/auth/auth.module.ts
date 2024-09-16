import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module'; // Asegúrate de que la ruta sea correcta
import { AuthController } from './auth.controller'; // Importa el controlador
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obtener la clave secreta desde .env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3600s'), // Tiempo de expiración
        },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController], // Asegúrate de que el controlador esté registrado aquí
})
export class AuthModule {}
