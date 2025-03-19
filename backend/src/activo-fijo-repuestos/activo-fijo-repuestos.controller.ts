import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ActivoFijoRepuestosService } from './activo-fijo-repuestos.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('activo-fijo-repuestos')
@Controller('activo-fijo-repuestos')
export class ActivoFijoRepuestosController {
    constructor(private readonly activoFijoRepuestosService: ActivoFijoRepuestosService) {}

    @Post('solicitud/:id/repuestos')
    @ApiOperation({ summary: 'Guardar repuestos y estado de activos fijos para una solicitud' })
    @ApiResponse({ status: 201, description: 'Repuestos guardados exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async guardarRepuestos(
        @Param('id') solicitudId: number,
        @Body() data: any
    ) {
        return await this.activoFijoRepuestosService.guardarRepuestosActivoFijo(solicitudId, data);
    }

    @Get('solicitud/:id/repuestos')
    @ApiOperation({ summary: 'Obtener repuestos y estado de activos fijos de una solicitud' })
    @ApiResponse({ status: 200, description: 'Repuestos obtenidos exitosamente' })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async obtenerRepuestos(@Param('id') solicitudId: number) {
        return await this.activoFijoRepuestosService.obtenerRepuestosPorSolicitud(solicitudId);
    }
} 