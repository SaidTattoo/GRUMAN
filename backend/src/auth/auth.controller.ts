import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

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
        console.log('loginDto', loginDto);
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

  
}
