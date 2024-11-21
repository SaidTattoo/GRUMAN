import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Client } from 'src/client/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, User]),
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'miClaveSecreta',
      signOptions: { expiresIn: '1h' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
