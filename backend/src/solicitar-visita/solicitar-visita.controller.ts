import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Put, Query, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    console.log('Datos recibidos:', createSolicitarVisitaDto);

    if (!createSolicitarVisitaDto.clientId || isNaN(Number(createSolicitarVisitaDto.clientId))) {
      throw new HttpException(
        'El campo clientId es obligatorio y debe ser un número válido.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const solicitud = {
      ...createSolicitarVisitaDto,
      clientId: Number(createSolicitarVisitaDto.clientId),
      fechaIngreso: new Date(createSolicitarVisitaDto.fechaIngreso),
      status: createSolicitarVisitaDto.status || 'pendiente',
      aprobada_por_id: createSolicitarVisitaDto.aprobada_por_id || null
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

  @Get('finalizadas')
  async getSolicitudesFinalizadas() {
    return this.solicitarVisitaService.getSolicitudesFinalizadas();
  }

  @Get('validadas')
  async getSolicitudesValidadas() {
    return this.solicitarVisitaService.getSolicitudesValidadas();
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

  @Get('solicitudes-del-dia')
  
  async getSolicitudesDelDia() {
    console.log('[Controller] Iniciando getSolicitudesDelDia');
    try {
        const result = await this.solicitarVisitaService.getSolicitudesDelDia();
        console.log('[Controller] Solicitudes encontradas:', result?.length || 0);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('[Controller] Error en getSolicitudesDelDia:', error);
        throw new HttpException(
            'Error al obtener las solicitudes del día',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }
  @Get('servicios-realizados')
  async getSolicitudesDelDia2(
    @Query('clientId') clientId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('mesFacturacion') mesFacturacion?: string,
    @Query('tipoServicio') tipoServicio?: string,
    @Query('tipoBusqueda') tipoBusqueda?: string,
    @Query('tipoSolicitud') tipoSolicitud?: string
  ) {
    console.log( clientId, fechaInicio, fechaFin, mesFacturacion, tipoServicio, tipoBusqueda, tipoSolicitud );
    try {
        const result = await this.solicitarVisitaService.getSolicitudesDelDia2(clientId, fechaInicio, fechaFin, mesFacturacion, tipoServicio, tipoBusqueda, tipoSolicitud);
        console.log('[Controller] Solicitudes encontradas:', result?.length || 0);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('[Controller] Error en getSolicitudesDelDia:', error);
        throw new HttpException(
            'Error al obtener las solicitudes del día',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

  @Get('solicitudes-del-dia/:clientId')
  async getSolicitudesDelDiaPorCliente(@Param('clientId') clientId: number) {
    console.log('[Controller] Iniciando getSolicitudesDelDiaPorCliente');
    try {
        const result = await this.solicitarVisitaService.getSolicitudDelDiaPorCliente(clientId);
        console.log('[Controller] Solicitudes encontradas:', result?.length || 0);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('[Controller] Error en getSolicitudesDelDia:', error);
        throw new HttpException(
            'Error al obtener las solicitudes del día',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
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
  async update(@Param('id') id: string, @Body() updateSolicitudVisitaDto: any) {
    try {
      // Validar que la solicitud existe
      const solicitud = await this.solicitarVisitaService.getSolicitudVisita(+id);
      if (!solicitud) {
        throw new NotFoundException(`Solicitud with ID ${id} not found`);
      }

      // Procesar los repuestos pendientes de eliminar
      if (updateSolicitudVisitaDto.listaInspeccion) {
        updateSolicitudVisitaDto.listaInspeccion = updateSolicitudVisitaDto.listaInspeccion.map((lista: any) => ({
          ...lista,
          items: lista.items.map((item: any) => ({
            ...item,
            subItems: item.subItems.map((subItem: any) => ({
              ...subItem,
              repuestos: (subItem.repuestos || []).filter((repuesto: any) => !repuesto.pendingDelete)
            }))
          }))
        }));
      }

      // Actualizar la solicitud
      const result = await this.solicitarVisitaService.update(+id, updateSolicitudVisitaDto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating solicitud');
    }
  }

  @Get('tecnico/:rut')
  async getSolicitudesPorTecnico(@Param('rut') rut: string) {
    return this.solicitarVisitaService.solicitudesPorTecnico(rut);
  }

  @Post(':id/reabrir')
  async reabrirSolicitud(@Param('id') id: number) {
    try {
      const solicitud = await this.solicitarVisitaService.reabrirSolicitud(id);
      return {
        success: true,
        data: solicitud
      };
    } catch (error) {
      throw new HttpException('Error al reabrir la solicitud', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/validar')
  async validarSolicitud(
    @Param('id') id: number, 
    @Body() data: { 
        validada_por_id: number,
        especialidad?: string,
        ticketGruman?: string,
        observaciones?: string,
        longitud_movil?: string,
        latitud_movil?: string,
        repuestos?: { [key: string]: any[] }
    }
  ) {
    console.log('Controller: Validando solicitud:', { id, data });
    try {
        await this.solicitarVisitaService.updateSolicitudVisita(id, {
            especialidad: data.especialidad,
            ticketGruman: data.ticketGruman,
            observaciones: data.observaciones,
            longitud_movil: data.longitud_movil,
            latitud_movil: data.latitud_movil,
            repuestos: data.repuestos
        });

        const result = await this.solicitarVisitaService.validarSolicitud(
            id, 
            data.validada_por_id
        );
        
        console.log('Controller: Resultado de validación:', result);
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Controller: Error en validación:', error);
        throw new HttpException(
            'Error al validar la solicitud', 
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

 /*  @Get('servicios-realizados')
  async getServiciosRealizados(
    @Query('clientId') clientId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('mesFacturacion') mesFacturacion?: string,
    @Query('tipoServicio') tipoServicio?: string,
    @Query('tipoBusqueda') tipoBusqueda?: string,
    @Query('tipoSolicitud') tipoSolicitud?: string
  ) {
    try {
        console.log('[Controller] getServiciosRealizados - Received params:', {
            clientId, 
            fechaInicio, 
            fechaFin, 
            mesFacturacion, 
            tipoServicio,
            tipoBusqueda,
            tipoSolicitud
        });
        
        const result = await this.solicitarVisitaService.getServiciosRealizados({
            tipoBusqueda,
            fechaInicio,
            fechaFin,
            clientId: clientId ? parseInt(clientId) : undefined,
            mesFacturacion,
            tipoServicio,
            tipoSolicitud
        });

        console.log('[Controller] getServiciosRealizados - Result count:', result?.length || 0);
        
        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('[Controller] getServiciosRealizados - Error:', error);
        throw new HttpException(
            'Error al obtener servicios realizados',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  } */
}
