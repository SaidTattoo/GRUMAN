import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ClienteRepuestoService } from './cliente-repuesto.service';
import { CreateClienteRepuestoDto } from './dto/create-cliente-repuesto.dto';
import { UpdateClienteRepuestoDto } from './dto/update-cliente-repuesto.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('cliente-repuesto')
@Controller('cliente-repuesto')
export class ClienteRepuestoController {
    constructor(private readonly clienteRepuestoService: ClienteRepuestoService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los precios por cliente' })
    async findAll() {
        return await this.clienteRepuestoService.findAll();
    }

    @Get('repuesto/:id')
    @ApiOperation({ summary: 'Obtener precios por repuesto' })
    async findByRepuesto(@Param('id') repuestoId: number) {
        return await this.clienteRepuestoService.findByRepuesto(repuestoId);
    }

    @Get('repuesto/:id/cliente/:clienteId')
    @ApiOperation({ summary: 'Obtener precio por repuesto y cliente' })
    async findByRepuestoAndCliente(@Param('id') repuestoId: number, @Param('clienteId') clienteId: number) {
        return await this.clienteRepuestoService.findByClienteAndRepuesto(repuestoId, clienteId);
    }

    @Get(':id/historial')
    @ApiOperation({ summary: 'Obtener historial de cambios de precios' })
    async getHistorial(@Param('id') id: number) {
        return await this.clienteRepuestoService.getHistorialByClienteRepuesto(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo precio por cliente' })
    async create(@Body() createDto: CreateClienteRepuestoDto) {
        return await this.clienteRepuestoService.create(createDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar precio por cliente' })
    async update(
        @Param('id') id: number,
        @Body() updateDto: UpdateClienteRepuestoDto
    ) {
        return await this.clienteRepuestoService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar precio por cliente' })
    async delete(@Param('id') id: number) {
        return await this.clienteRepuestoService.delete(id);
    }
} 