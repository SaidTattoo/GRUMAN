import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
@ApiTags('usuarios')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    findAllUsers(): Promise<User[]> {
        return this.usersService.findAllUsers();
    }


    @Get('client/:id') 
    @ApiOperation({ summary: 'Obtener usuarios por ID de cliente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del cliente' })
    findAllUsersByClient(@Param('id') id: number): Promise<User[]> {
        return this.usersService.findAllUsersByClient(id);
    }

    @Get('rut/:rut')
    @ApiOperation({ summary: 'Obtener usuario por RUT' })
    @ApiParam({ name: 'rut', type: String, description: 'RUT del usuario' })
    findOneUserByRut(@Param('rut') rut: string): Promise<User | undefined> {
        return this.usersService.findOneUser(rut);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un usuario' })
    @ApiParam({ name: 'clientId', type: Number, description: 'ID del cliente' })
    @ApiBody({
        description: 'Estructura del usuario a crear',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de usuario',
                value: {
                    name: 'Juan Pérez',
                    rut: '12345678-9',
                    email: 'usuario@example.com',
                    password: 'password',
                    clientId: 1,
                },
            },
        },
    })
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
      if (!createUserDto.rut || !createUserDto.email || !createUserDto.password || !createUserDto.clientId) {
        throw new BadRequestException('El cuerpo de la solicitud debe incluir un usuario y un clientId.');
      }
      return this.usersService.createUser(createUserDto);
    }

    @Patch(':id/password')
    @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
    @ApiBody({
        description: 'Estructura de la contraseña a cambiar',
        examples: {
            ejemplo1: { summary: 'Ejemplo de contraseña', value: { password: 'nuevaContraseña' } },
        },
    })
    changePassword(@Param('id') id: number, @Body() newPassword: string): Promise<User> {
        return this.usersService.changePassword(id, newPassword);
    }


    @Get('client/:id')
    @ApiOperation({ summary: 'Obtener usuarios por ID de cliente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del cliente' })
    getAllUsersByClient(@Param('id') id: number): Promise<User[]> {
        return this.usersService.getAllUsersByClient(id);
    }
}
