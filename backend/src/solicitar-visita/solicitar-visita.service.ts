import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SolicitarVisita, SolicitudStatus } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { User } from 'src/users/users.entity';
import { ItemRepuesto } from 'src/inspection/entities/item-repuesto.entity';
import { FinalizarServicioDto } from './dto/finalizar-servicio.dto';
import { In, Between } from 'typeorm';
import { FacturacionService } from 'src/facturacion/facturacion.service';
import { Repuesto } from 'src/repuestos/repuestos.entity';

interface ServiciosRealizadosParams {
  tipoBusqueda: string;
  clientId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  mesFacturacion?: string;
  tipoServicio?: string;
  tipoSolicitud?: string;
}

@Injectable()
export class SolicitarVisitaService {
    constructor(
        @InjectRepository(SolicitarVisita)
        private solicitarVisitaRepository: Repository<SolicitarVisita>,
        @InjectRepository(Locales)
        private localesRepository: Repository<Locales>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(TipoServicio)
        private tipoServicioRepository: Repository<TipoServicio>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ItemRepuesto)
        private itemRepuestoRepository: Repository<ItemRepuesto>,
        private facturacionService: FacturacionService,
        @InjectRepository(Repuesto)
        private repuestoRepository: Repository<Repuesto>
    ) {}

    /**
     * Crea una nueva solicitud de visita técnica
     * @param solicitud - Objeto con los datos de la solicitud
     * @returns Promise<SolicitarVisita> - Retorna la solicitud creada
     */
    async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
        const solicitudVisita = new SolicitarVisita();
      
      
        // Busca y asigna el tipo de servicio seleccionado
        const tipoServicio = await this.tipoServicioRepository.findOne({ where: { id: solicitud.tipoServicioId } });
        solicitudVisita.tipoServicioId = tipoServicio.id;

        // Busca y asigna el local y cliente relacionados
        solicitudVisita.local = await this.localesRepository.findOne({ where: { id: solicitud.localId } });
        solicitudVisita.client = await this.clientRepository.findOne({ where: { id: solicitud.clientId } });

        // Asigna los datos básicos de la solicitud
        solicitudVisita.sectorTrabajoId = solicitud.sectorTrabajoId;
        solicitudVisita.especialidad = solicitud.especialidad;
        solicitudVisita.ticketGruman = solicitud.ticketGruman;
        solicitudVisita.observaciones = solicitud.observaciones;
        solicitudVisita.fechaIngreso = solicitud.fechaIngreso;
        solicitudVisita.imagenes = solicitud.imagenes;
        solicitudVisita.tipo_mantenimiento = solicitud.tipo_mantenimiento;

        // Asigna el técnico si fue especificado
        if (solicitud.tecnico_asignado_id) {
            solicitudVisita.tecnico_asignado = await this.userRepository.findOne({ 
                where: { id: solicitud.tecnico_asignado_id } 
            });
        }
        if(solicitudVisita.tipo_mantenimiento === 'programado') {
            // Obtener las facturaciones del cliente
            const facturacion = await this.facturacionService.listarFacturacionPorCliente(solicitudVisita.client.id);    
            
            // Obtener el mes y año de la fecha de ingreso
            const fechaIngreso = new Date(solicitudVisita.fechaIngreso);
            const mesFormateado = `${this.getMesNombre(fechaIngreso.getMonth())} ${fechaIngreso.getFullYear()}`;
            
            // Buscar el período de facturación por el mes formateado
            const periodoCorrespondiente = facturacion.find(periodo => 
                periodo.mes === mesFormateado
            );

            if (!periodoCorrespondiente) {
                throw new BadRequestException(`No existe un período de facturación para ${mesFormateado}`);
            }

            // Buscar solicitudes programadas existentes para el mismo local en el mismo mes
            const solicitudesExistentes = await this.solicitarVisitaRepository.find({
                where: {
                    local: { id: solicitudVisita.local.id },
                    tipo_mantenimiento: 'programado',
                    fechaIngreso: Between(
                        new Date(periodoCorrespondiente.fecha_inicio),
                        new Date(periodoCorrespondiente.fecha_termino)
                    )
                }
            });

            if (solicitudesExistentes.length > 0) {
                throw new BadRequestException(
                    `Ya existe una solicitud de visita programada para este local en ${mesFormateado}`
                );
            }
        }
        // Si la solicitud está aprobada, asigna el aprobador
        if (solicitud.status === 'aprobada' && solicitud.aprobada_por_id) {
            solicitudVisita.status = SolicitudStatus.APROBADA;
            solicitudVisita.aprobada_por = await this.userRepository.findOne({ 
                where: { id: solicitud.aprobada_por_id } 
            });
            solicitudVisita.aprobada_por_id = solicitud.aprobada_por_id;
        }

        // Guarda y retorna la solicitud creada
        return await this.solicitarVisitaRepository.save(solicitudVisita);
    }

    getSolicitudVisita(id: number): Promise<SolicitarVisita> {

        
        return this.solicitarVisitaRepository.findOne({ 
          where: { id }, 
          relations: [
            'local', 
            'client', 
            'tecnico_asignado',
            'itemRepuestos',
            'itemRepuestos.repuesto'
          ] 
        });
    }


    getSolicitudesVisita(): Promise<SolicitarVisita[]> {
        return this.solicitarVisitaRepository.find({ 
          relations: ['local', 'client', 'tecnico_asignado'],
          order: { fechaIngreso: 'DESC' }
        });
    }

    async getSolicitudesAprobadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.APROBADA, SolicitudStatus.APROBADA]) },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Aprobadas]:', JSON.stringify(data, null, 2));
        return data;
    }

//filtrar por fecha que sea la misma del dia actual con la de fechaVisita pero solo dia mes y año no hora min segundos

    async solicitudesPorTecnico(rut: string): Promise<SolicitarVisita[]> {
        // Create date objects for start and end of current day
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day

        const data = await this.solicitarVisitaRepository.find({ 
            where: { 
                tecnico_asignado: { rut },
                fechaVisita: Between(today, tomorrow),
                status: In([SolicitudStatus.APROBADA, SolicitudStatus.EN_SERVICIO]) 
            },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaVisita: 'DESC' }
        });
        return data;
    }

    async getSolicitudesRechazadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: SolicitudStatus.RECHAZADA },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Rechazadas]:', JSON.stringify(data, null, 2));
        return data;
    }


  async getSolicitudByIdItems(id: number): Promise<SolicitarVisita> {
    return this.solicitarVisitaRepository.findOne({ 
      where: { id },
      relations: ['itemRepuestos','local','client','tecnico_asignado']
    });
  }




    async getSolicitudesFinalizadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.FINALIZADA, SolicitudStatus.FINALIZADA]) },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }
    
    async getSolicitudesValidadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.VALIDADA, SolicitudStatus.REABIERTA]) },
            relations: ['local', 'client', 'tecnico_asignado'],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }

    async aprovarSolicitudVisita(id: number): Promise<SolicitarVisita> {
       await this.solicitarVisitaRepository.update(id, { status: SolicitudStatus.APROBADA });
       
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    async rechazarSolicitudVisita(id: number): Promise<SolicitarVisita> {
         await this.solicitarVisitaRepository.update(id, { status: SolicitudStatus.RECHAZADA });
        
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    async finalizarSolicitudVisita(id: number): Promise<SolicitarVisita> {
        await this.solicitarVisitaRepository.update(id, { status: SolicitudStatus.FINALIZADA });
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    //quiero obtener la cantidad de solicitudes pendientes
    async getPendientes(): Promise<number> {
        const pendientes = await this.solicitarVisitaRepository.count({
            where: { status: SolicitudStatus.PENDIENTE }
        });
        return pendientes;
    }

    async updateSolicitudVisita(id: number, solicitud: any): Promise<SolicitarVisita> {
      const visita = await this.solicitarVisitaRepository.findOne({ 
        where: { id }
      });

      if (!visita) {
        throw new NotFoundException(`Visita con ID ${id} no encontrada`);
      }

      await this.solicitarVisitaRepository.update(id, {
        ...solicitud,
        fecha_hora_validacion: new Date()
       
      });

      return this.solicitarVisitaRepository.findOne({ 
        where: { id },
        relations: ['local', 'client', 'tecnico_asignado']
      });
    }
    /* agregar fecha_hora_inicio_servicio  */
    async iniciarServicio(id: number, latitud: string, longitud: string): Promise<SolicitarVisita> {
        await this.solicitarVisitaRepository.update(id, { 
            status: SolicitudStatus.EN_SERVICIO, 
            fecha_hora_inicio_servicio: new Date(), 
            latitud_movil: latitud,
            longitud_movil: longitud
        });
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }
/* agregar fecha_hora_fin_servicio */
    async finalizarServicio(id: number, data: FinalizarServicioDto): Promise<SolicitarVisita> {
        console.log(`🔍 Iniciando finalizarServicio con ID: ${id}`);

        const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: ['itemRepuestos', 'itemRepuestos.repuesto']
        });

        if (!solicitud) {
            console.log(`❌ No se encontró la solicitud con ID: ${id}`);
            throw new NotFoundException(`Solicitud with ID ${id} not found`);
        }

        console.log(`✅ Solicitud encontrada:`, solicitud);

        // Guardar los repuestos primero
        for (const itemId in data.repuestos) {
            const itemData = data.repuestos[itemId];
            console.log(`📦 Procesando item ${itemId}:`, itemData);
            
            // Obtener repuestos existentes para este item
            const existingRepuestos = solicitud.itemRepuestos.filter(
                ir => ir.itemId === Number(itemId)
            );
            console.log(`🔍 Repuestos existentes para item ${itemId}:`, existingRepuestos);

            // Procesar nuevos repuestos
            for (const repuestoData of itemData.repuestos) {
                // Verificar si el repuesto ya existe
                const repuestoExistente = existingRepuestos.find(
                    er => er.repuestoId === repuestoData.repuesto.id
                );

                if (!repuestoExistente) {
                    try {
                        console.log(`➕ Agregando nuevo repuesto:`, repuestoData);
                        const itemRepuestoData = {
                            itemId: Number(itemId),
                            repuestoId: repuestoData.repuesto.id,
                            cantidad: repuestoData.cantidad || 0,
                            comentario: repuestoData.comentario || '',
                            estado: itemData.estado || 'pendiente',
                            fotos: itemData.fotos || [],
                            solicitarVisitaId: Number(id)
                        };

                        console.log(`💾 Intentando guardar nuevo itemRepuesto:`, itemRepuestoData);
                        const savedItem = await this.itemRepuestoRepository.save(itemRepuestoData);
                        console.log(`✅ Nuevo ItemRepuesto guardado exitosamente:`, savedItem);
                    } catch (error) {
                        console.log(`❌ Error al guardar repuesto:`, error);
                        console.log(`🔍 Detalles del repuesto que falló:`, repuestoData);
                        throw error;
                    }
                } else {
                    console.log(`ℹ️ Repuesto ya existe, no es necesario agregarlo:`, repuestoExistente);
                }
            }
        }

        console.log(`📝 Actualizando estado de la solicitud...`);

        await this.solicitarVisitaRepository.update(id, {
            status: SolicitudStatus.FINALIZADA,
            fecha_hora_fin_servicio: new Date(),
            firma_cliente: data.firma_cliente,
            observaciones: data.observaciones
        });

        const updatedSolicitud = await this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: ['itemRepuestos', 'itemRepuestos.repuesto']
        });

        console.log(`✅ Solicitud finalizada exitosamente:`, updatedSolicitud);
        return updatedSolicitud;
    }

    async reabrirSolicitud(id: number): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id }
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Actualizar el estado a reabierta
        visita.status = SolicitudStatus.REABIERTA;
        
        return this.solicitarVisitaRepository.save(visita);
    }


    async validarSolicitud(id: number, validada_por_id: number): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id }
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Guardar los repuestos temporales
        
        console.log('visita', visita);
        // Combinar los datos de validación con los datos actualizados del formulario
        const updateData = { 
            ...visita,
            status: SolicitudStatus.VALIDADA, 
            validada_por_id: validada_por_id,
            fecha_hora_validacion: new Date(),
            especialidad: visita.especialidad,
            ticketGruman: visita.ticketGruman,
            observaciones: visita.observaciones,
            longitud_movil: visita.longitud_movil,
            latitud_movil: visita.latitud_movil,
        };
        
        // Actualizar la entidad con todos los cambios
        await this.solicitarVisitaRepository.update(id, updateData);
        
        // Retornar la entidad actualizada con sus relaciones
        return this.solicitarVisitaRepository.findOne({ 
            where: { id },
            relations: ['local', 'client', 'tecnico_asignado', 'itemRepuestos', 'itemRepuestos.repuesto']
        });
    }

    async getSolicitudesDelDia(): Promise<SolicitarVisita[]> {
        console.log('[Service] Iniciando getSolicitudesDelDia');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
        
        console.log('[Service] Parámetros de búsqueda:', {
            today: today.toISOString(),
            tomorrow: tomorrow.toISOString(),
            statuses: [
                SolicitudStatus.VALIDADA, 
                SolicitudStatus.REABIERTA,
                SolicitudStatus.EN_SERVICIO,
                SolicitudStatus.FINALIZADA,
                SolicitudStatus.APROBADA,
                SolicitudStatus.RECHAZADA,
                SolicitudStatus.PENDIENTE
            ]
        });

        try {
            const data = await this.solicitarVisitaRepository.find({ 
               
                where: { 
                    status: In([
                        SolicitudStatus.VALIDADA, 
                        SolicitudStatus.REABIERTA,
                        SolicitudStatus.EN_SERVICIO,
                        SolicitudStatus.FINALIZADA,
                        SolicitudStatus.APROBADA,
                        SolicitudStatus.RECHAZADA,
                        SolicitudStatus.PENDIENTE
                    ]),
                    fechaIngreso: Between(today, tomorrow)
                },
                relations: ['local', 'client', 'tecnico_asignado', 'tipoServicio'],
                order: { fechaIngreso: 'DESC' }
            });

            console.log('[Service] Query ejecutada exitosamente');
            console.log('[Service] Resultados:', {
                totalRegistros: data.length,
                primerRegistro: data[0] ? {
                    id: data[0].id,
                    fechaIngreso: data[0].fechaIngreso,
                    status: data[0].status,
                    tipoServicioId: data[0].tipoServicioId  // Usando el nombre correcto de la propiedad
                } : null
            });

            return data || [];
        } catch (error) {
            console.error('[Service] Error al ejecutar la consulta:', error);
            throw error;
        }
    }

    async getSolicitudesDelDia2(
        clientId: string, 
        fechaInicio: string, 
        fechaFin: string, 
        mesFacturacion: string, 
        tipoServicio: string, 
        tipoBusqueda: string, 
        tipo_mantenimiento: string
    ): Promise<SolicitarVisita[]> {
        console.log('[Service] Iniciando getSolicitudesDelDia con params:', {
            clientId, fechaInicio, fechaFin, mesFacturacion, tipoServicio, tipoBusqueda, tipo_mantenimiento
        });
        
        try {
            const whereClause: any = {
                status: In([
                    SolicitudStatus.VALIDADA, 
                    SolicitudStatus.REABIERTA,
                    SolicitudStatus.EN_SERVICIO,
                    SolicitudStatus.FINALIZADA,
                    SolicitudStatus.APROBADA,
                    SolicitudStatus.RECHAZADA,
                    SolicitudStatus.PENDIENTE
                ])
            };

            // Add client filter if provided
            if (clientId) {
                whereClause.client = { id: parseInt(clientId) };
            }

            // Add tipo servicio filter if provided
            if (tipoServicio && tipoServicio !== 'todos') {
                whereClause.tipoServicioId = parseInt(tipoServicio);
            }

            // Add date filters with proper date handling
            if (tipoBusqueda === 'rangoFechas' && fechaInicio && fechaFin) {
                // Convertir las fechas al formato correcto y ajustar las horas
                const startDate = new Date(this.parseFecha(fechaInicio));
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(this.parseFecha(fechaFin));
                endDate.setHours(23, 59, 59, 999);

                console.log('Fechas procesadas:', { startDate, endDate });
                whereClause.fechaIngreso = Between(startDate, endDate);
            } else if (tipoBusqueda === 'mesFacturacion' && mesFacturacion) {
                const [mes, año] = mesFacturacion.split(' ');
                console.log('Mes y año recibidos:', { mes, año });
                
                const mesNumero = this.getMesNumero(mes);
                console.log('Número de mes:', mesNumero);
                
                const primerDia = new Date(Date.UTC(parseInt(año), mesNumero, 1));
                primerDia.setUTCHours(0, 0, 0, 0);
                
                const ultimoDia = new Date(Date.UTC(parseInt(año), mesNumero + 1, 0));
                ultimoDia.setUTCHours(23, 59, 59, 999);

                console.log('Rango de fechas calculado:', {
                    primerDia: primerDia.toISOString(),
                    ultimoDia: ultimoDia.toISOString(),
                    mesNumero,
                    año
                });
                
                whereClause.fechaIngreso = Between(primerDia, ultimoDia);
            }

            // Add tipo_mantenimiento filter if provided
            if (tipo_mantenimiento && tipo_mantenimiento !== 'todos') {
                whereClause.tipo_mantenimiento = tipo_mantenimiento;
            }

            console.log('Where clause final:', whereClause);

            const data = await this.solicitarVisitaRepository.find({ 
                where: whereClause,
                relations: ['local', 'client', 'tecnico_asignado', 'tipoServicio'],
                order: { fechaIngreso: 'DESC' }
            });

            console.log(`Se encontraron ${data.length} registros`);
            return data || [];
        } catch (error) {
            console.error('[Service] Error al ejecutar la consulta:', error);
            throw error;
        }
    }

    // Método auxiliar para parsear fechas en formato DD-MM-YYYY
    private parseFecha(fecha: string): Date {
        const [dia, mes, año] = fecha.split('-').map(num => parseInt(num));
        return new Date(año, mes - 1, dia);
    }

    // Método auxiliar para convertir nombre del mes a número (0-11)
    private getMesNumero(mes: string): number {
        const meses = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3,
            'Mayo': 4, 'Junio': 5, 'Julio': 6, 'Agosto': 7,
            'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };
        return meses[mes] || 0;
    }

    private getMesNombre(mes: number): string {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes];
    }

    async getSolicitudDelDiaPorCliente(clientId: number): Promise<SolicitarVisita[]> {
        console.log('[Service] Iniciando getSolicitudDelDiaPorCliente');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
        
        console.log('[Service] Parámetros de búsqueda:', {
            today: today.toISOString(),
            tomorrow: tomorrow.toISOString(),
            statuses: [
                SolicitudStatus.VALIDADA, 
                SolicitudStatus.REABIERTA,
                SolicitudStatus.EN_SERVICIO,
                SolicitudStatus.FINALIZADA,
                SolicitudStatus.APROBADA,
                SolicitudStatus.RECHAZADA,
                SolicitudStatus.PENDIENTE
            ]
        });

        try {
            const data = await this.solicitarVisitaRepository.find({ 
                
                where: { 
                    client: { id: clientId },
                    status: In([
                        SolicitudStatus.VALIDADA, 
                        SolicitudStatus.REABIERTA,
                        SolicitudStatus.EN_SERVICIO,
                        SolicitudStatus.FINALIZADA,
                        SolicitudStatus.APROBADA,
                        SolicitudStatus.RECHAZADA,
                        SolicitudStatus.PENDIENTE
                    ]),
                    fechaIngreso: Between(today, tomorrow)
                },
                relations: ['local', 'client', 'tecnico_asignado', 'tipoServicio'],
                order: { fechaIngreso: 'DESC' }
            });

            console.log('[Service] Query ejecutada exitosamente');
            console.log('[Service] Resultados:', {
                totalRegistros: data.length,
                primerRegistro: data[0] ? {
                    id: data[0].id,
                    fechaIngreso: data[0].fechaIngreso,
                    status: data[0].status,
                    observaciones: data[0].observaciones,
                    tipoServicioId: data[0].tipoServicioId  // Usando el nombre correcto de la propiedad
                } : null
            });

            return data || [];
        } catch (error) {
            console.error('[Service] Error al ejecutar la consulta:', error);
            throw error;
        }
    }

    async update(id: number, updateSolicitudVisitaDto: any) {
        try {
            const solicitud = await this.solicitarVisitaRepository.findOne({
                where: { id },
                relations: ['itemRepuestos']
            });

            if (!solicitud) {
                throw new NotFoundException(`Solicitud with ID ${id} not found`);
            }

            // Actualizar los campos básicos
            Object.assign(solicitud, updateSolicitudVisitaDto);

            // Guardar la solicitud actualizada
            const result = await this.solicitarVisitaRepository.save(solicitud);

            return result;
        } catch (error) {
            throw new InternalServerErrorException('Error updating solicitud');
        }
    }
}
