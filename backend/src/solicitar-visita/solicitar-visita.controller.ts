import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Put, Query, NotFoundException, InternalServerErrorException, BadRequestException, Res, Header, DefaultValuePipe, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { Response } from 'express';
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

  @Post('finalizar-servicio-v2/:id')
  async finalizarServicioV2(
    @Param('id') id: number,
    @Body() data: any[]
  ): Promise<SolicitarVisita> {
    return this.solicitarVisitaService.finalizarServicioV2(id, data);
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
      fechaVisita: createSolicitarVisitaDto.fechaVisita,
      fechaIngreso: new Date(),
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


  @Get('atendidas_proceso')
  async getSolicitudesAtendidasProceso() {
    return this.solicitarVisitaService.getSolicitudesAtendidasProceso();
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

  @Get('solicitudes-visita-multifiltro')
  async getSolicitudesVisitaMultifiltro(
    @Query('clienteId') clienteId?: string,
    @Query('status') status?: string,
    @Query('tipoMantenimiento') tipoMantenimiento?: string,
    @Query('mesFacturacion') mesFacturacion?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, // Valor por defecto 1, convierte a número
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number, // Valor por defecto 10, convierte a número
  ) {
    const params = {
      clienteId,
      status,
      tipoMantenimiento,
      mesFacturacion,
      fechaDesde,
      fechaHasta,
      page,
      limit
    };
    return this.solicitarVisitaService.getSolicitudesVisitaMultifiltro(params);
  }

  @Get(':id')
  async getSolicitudVisita(@Param('id') id: number) {
    return this.solicitarVisitaService.getSolicitudVisita(id);
  }

  @Post(':id/aprobar')
  async aprobarSolicitudVisita(
    @Param('id') id: number,
    @Body() data: { 
      tecnico_asignado_id?: number, 
      aprobada_por_id?: number,
      fechaVisita?: Date,
      especialidad?: string,
      valorPorLocal?: number
    }
  ) {
    console.log('Aprobando solicitud:', id, 'con datos:', data);
    return this.solicitarVisitaService.aprovarSolicitudVisita(id, data);
  }

  @Post(':id/rechazar')
  async rechazarSolicitudVisita(
    @Param('id') id: number,
    @Body() data: { motivo: string, rechazada_por_id?: number }
  ) {
    console.log('Rechazando solicitud:', id, 'con datos:', data);
    return this.solicitarVisitaService.rechazarSolicitudVisita(id, data);
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
        registroVisita?: string,
        causaRaizId?: number,
        valorPorLocal?: number,
        repuestos?: { [key: string]: any[] },
        garantia?: string,
        turno?: string,
        estado_solicitud?: string,
        image_ot?: string
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
            registroVisita: data.registroVisita,
            causaRaizId: data.causaRaizId,
            valorPorLocal: data.valorPorLocal,
            repuestos: data.repuestos,
            garantia: data.garantia,
            turno: data.turno,
            estado_solicitud: data.estado_solicitud,
            image_ot: data.image_ot
        });

        const result = await this.solicitarVisitaService.validarSolicitud(
            id, 
            data.validada_por_id,
            data.causaRaizId,
            data.garantia,
            data.turno,
            data.estado_solicitud,
            data.image_ot
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

  @Post(':id/asignar-tecnico')
  async asignarTecnico(@Param('id') id: number, @Body() data: { tecnicoId: number, tipo: 'tecnico' | 'tecnico_2' }) {
    return this.solicitarVisitaService.asignarTecnico(id, data.tecnicoId, data.tipo);
  }

  @Post(':id/cambiar-tecnico')
  async cambiarTecnico(
    @Param('id') id: number, 
    @Body() data: { tecnicoId: number, tipo: 'tecnico' | 'tecnico_2' }
  ) {
    console.log('Controller: cambiarTecnico request:', { id, data });
    const result = await this.solicitarVisitaService.changeTecnico(id, data.tecnicoId, data.tipo);
    console.log('Controller: cambiarTecnico response:', result);
    return {
        success: true,
        data: result
    };
  }

  @Post(':id/item-estados')
  async manipularItemEstados(
    @Param('id') id: number,
    @Body() data: Array<{itemId: number, estado: string, comentario?: string}>
  ) {
    return await this.solicitarVisitaService.manipularItemEstados(id, data);
  }

  @Post(':id/facturacion/:facturacionId')
  async asociarConMesFacturacion(
    @Param('id') id: number,
    @Param('facturacionId') facturacionId: number
  ) {
    try {
      const solicitud = await this.solicitarVisitaService.asociarConMesFacturacion(id, facturacionId);
      return {
        success: true,
        message: 'Solicitud de visita asociada correctamente con el mes de facturación',
        data: solicitud
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al asociar la solicitud con el mes de facturación');
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
  @Get('buscar/:parametros')
  async buscarSolicitud(@Param('parametros') parametros: string) {
    try {
      // Convertir el string de parámetros a un array
      const parametrosArray = parametros.split(',').filter(param => param.trim());
      return await this.solicitarVisitaService.buscarSolicitud(parametrosArray);
    } catch (error) {
      throw new InternalServerErrorException('Error al procesar la búsqueda: ' + error.message);
    }
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: number,
    @Res() res: Response
  ) {
    try {
      console.log('Generando PDF para la solicitud:', id);
      const buffer = await this.solicitarVisitaService.generatePdf(id);
      
      if (!buffer || buffer.length === 0) {
        throw new Error('PDF generado está vacío');
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=solicitud-${id}.pdf`,
        'Content-Length': buffer.length,
        // Prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.end(buffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al generar el PDF: ' + error.message);
    }
  }
  @Post('subir-carga-masiva')
  async subirCargaMasiva(@Body() datos: any[]) {
    return this.solicitarVisitaService.subirCargaMasiva(datos);
  }
  @Delete(':id')
  async deleteSolicitud(@Param('id') id: number) {  
    return this.solicitarVisitaService.deleteSolicitud(id);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: number,
    @Body() data: { status: string }
  ) {
    try {
      await this.solicitarVisitaService.cambiarEstadoSolicitud(id, data.status);
      return {
        success: true,
        message: 'Estado actualizado correctamente'
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al cambiar el estado de la solicitud');
    }
  }

  @Post(':id/enviar-email')
  async enviarEmail(@Param('id') id: number) {
    try {
      return this.solicitarVisitaService.enviarEmail(id);
    } catch (error) {
      throw new InternalServerErrorException('Error al enviar el email');
    }
  }
}
