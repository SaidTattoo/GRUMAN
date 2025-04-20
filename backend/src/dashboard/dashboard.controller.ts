import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')

export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('contadores')
    @ApiOperation({ summary: 'Obtiene contadores de solicitudes por estado' })
    @ApiQuery({ name: 'clientId', required: false, description: 'ID del cliente para filtrar' })
    @ApiResponse({ status: 200, description: 'Contadores obtenidos correctamente' })
    async getContadores(@Query('clientId') clientId?: number) {
        if (clientId) {
            // Convert string to number if necessary
            clientId = Number(clientId);
        }
        return await this.dashboardService.getContadores(clientId);
    }

    @Get('estadisticas-por-cliente')
    @ApiOperation({ summary: 'Obtiene estadísticas agrupadas por cliente' })
    @ApiResponse({ status: 200, description: 'Estadísticas por cliente obtenidas correctamente' })
    async getEstadisticasPorCliente() {
        return await this.dashboardService.getEstadisticasPorCliente();
    }

    @Get('estadisticas-mensuales')
    @ApiOperation({ summary: 'Obtiene estadísticas mensuales para un año específico' })
    @ApiQuery({ name: 'year', required: false, description: 'Año para las estadísticas (por defecto, año actual)' })
    @ApiQuery({ name: 'clientId', required: false, description: 'ID del cliente para filtrar' })
    @ApiResponse({ status: 200, description: 'Estadísticas mensuales obtenidas correctamente' })
    async getEstadisticasMensuales(
        @Query('year') year?: number,
        @Query('clientId') clientId?: number
    ) {
        if (year) {
            year = Number(year);
        }
        if (clientId) {
            clientId = Number(clientId);
        }
        return await this.dashboardService.getEstadisticasMensuales(
            year, 
            clientId
        );
    }
}
