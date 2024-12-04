import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { SolicitarVisitaService } from './solicitar-visita.service';

import { SolicitarVisita } from './solicitar-visita.entity';
import { CreateSolicitarVisitaDto } from './dto/createSolicitarVisitaDto';
@Controller('solicitar-visita')
export class SolicitarVisitaController {
  constructor(private readonly solicitarVisitaService: SolicitarVisitaService) {}

  @Post()
async create(@Body() createSolicitarVisitaDto: any) {
  console.log('Valor de clientId:', createSolicitarVisitaDto.clientId);

  // Verificar que clientId sea un número válido
  if (!createSolicitarVisitaDto.clientId || isNaN(Number(createSolicitarVisitaDto.clientId))) {
    throw new HttpException(
      'El campo clientId es obligatorio y debe ser un número válido.',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Procesar la solicitud
  const solicitud = {
    ...createSolicitarVisitaDto,
    clientId: Number(createSolicitarVisitaDto.clientId),
    fechaIngreso: new Date(createSolicitarVisitaDto.fechaIngreso),
  };

  const result = await this.solicitarVisitaService.crearSolicitudVisita(solicitud);
  return {
    success: true,
    data: result,
  };
}

  @Get()
  async getSolicitudesVisita() {
    return this.solicitarVisitaService.getSolicitudesVisita();
  }

  @Get(':id')
  async getSolicitudVisita(@Param('id') id: number) {
    return this.solicitarVisitaService.getSolicitudVisita(id);
  }


  @Post(':id/aprobar')
  async aprobarSolicitudVisita(@Param('id') id: number) {
    return this.solicitarVisitaService.aprovarSolicitudVisita(id);
  }

  @Post(':id/rechazar')
  async rechazarSolicitudVisita(@Param('id') id: number) {
    return this.solicitarVisitaService.rechazarSolicitudVisita(id);
  }
}
