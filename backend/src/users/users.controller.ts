import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
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
    async createUser(@Body() createUserDto: any) {
        const { confirmPassword, ...userData } = createUserDto;
        return this.usersService.createUser(userData);
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

    @Get('tecnicos')
    @ApiOperation({ summary: 'Obtener todos los tecnicos' })
    findAllTecnicos(): Promise<User[]> {
        return this.usersService.findAllTecnicos();
    }

    @Get('tecnicos/:id')
    @ApiOperation({ summary: 'Obtener un tecnico por ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del tecnico' })
    findOneTecnico(@Param('id') id: number): Promise<User | undefined> {
        return this.usersService.findOneTecnico(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un usuario' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
    @ApiBody({
        description: 'Datos del usuario a actualizar',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de actualización de usuario',
                value: {
                    name: 'Juan Pérez',
                    lastName: 'Pérez',
                    email: 'juan@example.com',
                    rut: '12345678-9',
                    profile: 'user',
                    clients: [1, 2, 3] // IDs de los clientes
                }
            }
        }
    })
    async updateUser(
        @Param('id') id: number,
        @Body() updateUserDto: any
    ) {
        console.log('=== DEBUG UPDATE USER CONTROLLER ===');
        console.log('ID recibido:', id);
        console.log('DTO recibido:', JSON.stringify(updateUserDto, null, 2));
        
        try {
            const result = await this.usersService.updateUser(id, updateUserDto);
            console.log('Resultado de actualización:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error en controller:', error);
            throw error;
        }
    }
}
