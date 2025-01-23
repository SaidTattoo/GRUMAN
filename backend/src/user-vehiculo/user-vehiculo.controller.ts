import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserVehiculoService } from './user-vehiculo.service';
import { UserVehiculo } from './user-vehiculo.entity';

@Controller('user-vehiculo')
export class UserVehiculoController {
    constructor(private readonly userVehiculoService: UserVehiculoService) {}

    @Get()
    findAll() {
        return this.userVehiculoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.userVehiculoService.findOne(id);
    }

    @Post()
    async create(@Body() userVehiculo: UserVehiculo) {
        try {
            return await this.userVehiculoService.create(userVehiculo);
        } catch (error) {
            if (error.status === 400) {
                throw new HttpException({
                    message: error.message,
                    lastOdometro: error.lastOdometro
                }, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Error al crear la asignación', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() userVehiculo: UserVehiculo) {
        return this.userVehiculoService.update(id, userVehiculo);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.userVehiculoService.delete(id);
    }

    @Put(':id/odometro-fin')
    updateOdometroFin(@Param('id') id: number, @Body('odometroFin') odometroFin: number) {
        return this.userVehiculoService.updateOdometroFin(id, odometroFin);
    }

    @Get('last-assignment/:vehiculoId')
    findLastAssignmentByVehiculo(@Param('vehiculoId') vehiculoId: number) {
        return this.userVehiculoService.findLastAssignmentByVehiculo(vehiculoId);
    }

    @Get('historial')
    getHistorial() {
        return this.userVehiculoService.getHistorial();
    }
}
