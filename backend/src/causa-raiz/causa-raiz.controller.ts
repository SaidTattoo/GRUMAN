import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CausaRaizService } from './causa-raiz.service';
import { CausaRaiz } from './causa-raiz.entity';
import { CreateCausaRaizDto, UpdateCausaRaizDto } from './dto/causa-raiz.dto';

import { CausaRaizResponseDto } from './dto/causa-raiz-response.dto';

@ApiTags('causas-raiz')
@Controller('causas-raiz')

@ApiBearerAuth()
export class CausaRaizController {
  constructor(private readonly causaRaizService: CausaRaizService) {}

  @Post()

  @ApiOperation({ summary: 'Crear una nueva causa raíz' })
  @ApiResponse({ status: 201, description: 'La causa raíz ha sido creada exitosamente', type: CausaRaizResponseDto })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiResponse({ status: 409, description: 'Ya existe una causa raíz con ese nombre' })
  create(@Body() createCausaRaizDto: CreateCausaRaizDto): Promise<CausaRaiz> {
    return this.causaRaizService.create(createCausaRaizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las causas raíz' })
  @ApiResponse({ status: 200, description: 'Lista de causas raíz', type: [CausaRaizResponseDto] })
  findAll(): Promise<CausaRaiz[]> {
    return this.causaRaizService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una causa raíz por su ID' })
  @ApiResponse({ status: 200, description: 'Causa raíz encontrada', type: CausaRaizResponseDto })
  @ApiResponse({ status: 404, description: 'Causa raíz no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CausaRaiz> {
    return this.causaRaizService.findOne(id);
  }

  @Patch(':id')

  @ApiOperation({ summary: 'Actualizar una causa raíz' })
  @ApiResponse({ status: 200, description: 'Causa raíz actualizada exitosamente', type: CausaRaizResponseDto })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiResponse({ status: 404, description: 'Causa raíz no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe otra causa raíz con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCausaRaizDto: UpdateCausaRaizDto,
  ): Promise<CausaRaiz> {
    return this.causaRaizService.update(id, updateCausaRaizDto);
  }

  @Delete(':id')

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una causa raíz' })
  @ApiResponse({ status: 204, description: 'Causa raíz eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Causa raíz no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.causaRaizService.remove(id);
  }
} 