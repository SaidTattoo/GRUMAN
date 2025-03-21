import { Controller, Get, Post, Body, Put, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ChecklistClimaService } from './checklist_clima.service';
import { ChecklistClima } from './checklist_clima.entity';

@Controller('checklist-clima')
export class ChecklistClimaController {
  constructor(private readonly checklistClimaService: ChecklistClimaService) {}

  @Post()
  async create(@Body() createChecklistDto: any): Promise<ChecklistClima> {
    try {
      return await this.checklistClimaService.create(createChecklistDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear el checklist',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll(): Promise<ChecklistClima[]> {
    try {
      return await this.checklistClimaService.findAll();
    } catch (error) {
      throw new HttpException(
        'Error al obtener los checklists',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ChecklistClima> {
    try {
      return await this.checklistClimaService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener el checklist',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('solicitud/:solicitudId')
  async findBySolicitud(@Param('solicitudId') solicitudId: number): Promise<ChecklistClima[]> {
    try {
      return await this.checklistClimaService.findBySolicitud(solicitudId);
    } catch (error) {
      throw new HttpException(
        'Error al obtener los checklists de la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateChecklistDto: any
  ): Promise<ChecklistClima> {
    try {
      return await this.checklistClimaService.update(id, updateChecklistDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar el checklist',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    try {
      await this.checklistClimaService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar el checklist',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 