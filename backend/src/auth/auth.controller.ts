import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LoginTecnicoDto } from './dto/loginTecnico.dto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly mailService: MailService,
        private readonly usersService: UsersService
    ) {}

    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiBody({
        description: 'Estructura del login',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de login',
                value: {
                    email: 'example@example.com',
                    password: 'password',
                },
            },
        },
    })
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        //console.log('loginDto', loginDto);
        const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
        );
        if (!user) {
        return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message: 'Invalid credentials' });
        }

        const token = this.authService.generateJwtToken(user);
        return res.status(HttpStatus.OK).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            clientes: user.clients, // Incluye las compañías en la respuesta
        },
        });
    }

    @ApiOperation({ summary: 'Iniciar sesión para tecnicos' })
    @ApiBody({
        description: 'Estructura del login para tecnicos',
        type: LoginTecnicoDto,
    })
    @Post('login_tecnico')
    async loginTecnico(@Body() loginTecnicoDto: LoginTecnicoDto, @Res() res: Response) {
        const user = await this.authService.loginTecnico(loginTecnicoDto.rut, loginTecnicoDto.password);
        return res.status(HttpStatus.OK).json(user);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'usuario@ejemplo.com' }
            }
        }
    })
    async forgotPassword(@Body() body: { email: string }) {
        try {
            const { email } = body;
            
            // Verificar si el usuario existe
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Generar token de recuperación
            const token = crypto.randomBytes(32).toString('hex');
            
            // Guardar token y su fecha de expiración
            user.resetPasswordToken = token;
            user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
            await this.usersService.updateUser(user.id, user);

            // Enviar email
            await this.mailService.sendPasswordRecoveryEmail(email, token);

            return {
                message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña',
                success: true
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Error al procesar la solicitud',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Restablecer contraseña' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                newPassword: { type: 'string' }
            }
        }
    })
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        try {
            console.log('Intentando restablecer contraseña con token:', body.token);
            
            const user = await this.usersService.findByResetToken(body.token);
            console.log('Usuario encontrado:', user ? {
                id: user.id,
                email: user.email,
                resetPasswordExpires: user.resetPasswordExpires
            } : 'No encontrado');
            
            if (!user) {
                throw new BadRequestException('Token inválido o expirado');
            }

            const now = new Date();
            console.log('Fecha actual:', now);
            console.log('Fecha de expiración del token:', user.resetPasswordExpires);

            if (user.resetPasswordExpires < now) {
                throw new BadRequestException('El token ha expirado');
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(body.newPassword, 10);
            console.log('Contraseña hasheada correctamente');

            // Actualizar contraseña y limpiar tokens
            await this.usersService.updateUser(user.id, {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            });
            
            console.log('Usuario actualizado correctamente');

            return { message: 'Contraseña actualizada exitosamente' };
        } catch (error) {
            console.error('Error en resetPassword:', error);
            throw new BadRequestException(error.message);
        }
    }
}
