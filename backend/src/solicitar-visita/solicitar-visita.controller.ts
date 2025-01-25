import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Put } from '@nestjs/common';
import { SolicitarVisitaService } from './solicitar-visita.service';

import { SolicitarVisita } from './solicitar-visita.entity';
import { CreateSolicitarVisitaDto } from './dto/createSolicitarVisitaDto';
import { FinalizarServicioDto } from './dto/finalizar-servicio.dto';
@Controller('solicitar-visita')
export class SolicitarVisitaController {
  constructor(private readonly solicitarVisitaService: SolicitarVisitaService) {}

  @Post('iniciar-servicio/:id')
  async iniciarServicio(
    @Param('id') id: number,
    @Body() coords: { latitud_movil: string, longitud_movil: string }
  ): Promise<SolicitarVisita> {
    return this.solicitarVisitaService.iniciarServicio(
      id, 
      coords.latitud_movil,
      coords.longitud_movil
    );
  }

  @Post('finalizar-servicio/:id')
  async finalizarServicio(
    @Param('id') id: number,
    @Body() data: FinalizarServicioDto
  ): Promise<SolicitarVisita> {
    return this.solicitarVisitaService.finalizarServicio(id, data);
  }

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

  @Get('aprobadas')
  async getSolicitudesAprobadas() {
    try {
      const solicitudes = await this.solicitarVisitaService.getSolicitudesAprobadas();
      return {
        success: true,
        data: solicitudes
      };
    } catch (error) {
      throw new HttpException('Error al obtener solicitudes aprobadas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rechazadas')
  async getSolicitudesRechazadas() {
    try {
      const solicitudes = await this.solicitarVisitaService.getSolicitudesRechazadas();
      return {
        success: true,
        data: solicitudes
      };
    } catch (error) {
      throw new HttpException('Error al obtener solicitudes rechazadas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pendientes')
  async getPendientes() {
    console.log('solicitudes pendientes');
    return this.solicitarVisitaService.getPendientes();
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

  @Put(':id')
  async updateSolicitudVisita(@Param('id') id: number, @Body() solicitud: any) {
    return this.solicitarVisitaService.updateSolicitudVisita(id, solicitud);
  }

  @Get('tecnico/:rut')
  async getSolicitudesPorTecnico(@Param('rut') rut: string) {
    return this.solicitarVisitaService.solicitudesPorTecnico(rut);
  }
}
