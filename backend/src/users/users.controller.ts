import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiBody, ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
@ApiTags('usuarios')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
        console.log('UsersController inicializado');
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    findAll(): Promise<User[]> {
        return this.usersService.findAllUsers();
    }

    @Get('tecnicos')
    @ApiOperation({ summary: 'Obtener todos los tecnicos' })
    findAllTecnicos(): Promise<User[]> {
        console.log('Entrando al endpoint GET /users/tecnicos');
        try {
            const result = this.usersService.findAllTecnicos();
            console.log('Resultado obtenido del servicio');
            return result;
        } catch (error) {
            console.error('Error en findAllTecnicos:', error);
            throw error;
        }
    }

    @Get('tecnicos/:rut')
    @ApiOperation({ summary: 'Obtener tecnicos por RUT' })
    findTecnicosByRut(@Param('rut') rut: string): Promise<User[]> {
        return this.usersService.findTecnicosByRut(rut);
    }

    @Get('client/:id')
    @ApiOperation({ summary: 'Obtener usuarios por ID de cliente' })
    findAllUsersByClient(@Param('id') id: number): Promise<User[]> {
        return this.usersService.findAllUsersByClient(id);
    }

    @Get('rut/:rut')
    @ApiOperation({ summary: 'Obtener usuario por RUT' })
    findOneUserByRut(@Param('rut') rut: string): Promise<User | undefined> {
        return this.usersService.findOneUser(rut);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un usuario por ID' })
    findOne(@Param('id') id: number): Promise<User | undefined> {
        return this.usersService.findOne(id);
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
    
    @Delete('tecnicos/:id')
    @ApiOperation({ summary: 'Eliminar un técnico' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del técnico a eliminar' })
    async deleteTecnico(@Param('id') id: number): Promise<void> {
        return this.usersService.deleteTecnico(id);
    }

    @Get('tecnicos/:id/clientes')
    @ApiOperation({ summary: 'Obtener clientes asignados a un técnico' })
    async getTecnicoClientes(@Param('id') id: number) {
        return this.usersService.getTecnicoClientes(id);
    }

    @Get('tecnicos/:id/vehiculo-actual')
    @ApiOperation({ summary: 'Obtener vehículo asignado a un técnico' })
    async getTecnicoVehiculo(@Param('id') id: number) {
        return this.usersService.findVehiculoByTecnicoId(id);
    }

    @Patch('tecnicos/:rut/password')
    @ApiOperation({ summary: 'Cambiar la contraseña de un técnico por RUT' })
    @ApiParam({ name: 'rut', type: String, description: 'RUT del técnico' })
    async changePasswordByRut(@Param('rut') rut: string, @Body() newPassword: any): Promise<User> {
        return this.usersService.changePasswordByRut(rut, newPassword); 
    }

    @Get('tecnicos/rut/:rut')
    @ApiOperation({ summary: 'Get technicians by RUT' })
    @ApiResponse({ status: 200, description: 'Returns technician information including name and last name' })
    async getTecnicosByRut(@Param('rut') rut: string) {
        const tecnicos = await this.usersService.findTecnicosByRut(rut);
        return tecnicos.map(tecnico => ({
            id: tecnico.id,
            name: tecnico.name,
            lastName: tecnico.lastName,
            rut: tecnico.rut,
        }));
    }
}
            
