import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SolicitarVisita, SolicitudStatus } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { User } from 'src/users/users.entity';
import { ItemRepuesto } from 'src/inspection/entities/item-repuesto.entity';
import { ItemEstado } from 'src/inspection/entities/item-estado.entity';

import { In } from 'typeorm';
import { FacturacionService } from 'src/facturacion/facturacion.service';
import { Repuesto } from 'src/repuestos/repuestos.entity';
import { ItemFotos } from 'src/inspection/entities/item-fotos.entity';
import { DetalleRepuestoActivoFijo } from '../activo-fijo-repuestos/entities/detalle-repuesto-activo-fijo.entity';
import { ActivoFijoRepuestos } from '../activo-fijo-repuestos/entities/activo-fijo-repuestos.entity';
import { ChecklistClima } from 'src/checklist_clima/checklist_clima.entity';
import { ActivoFijoRepuestosService } from 'src/activo-fijo-repuestos/activo-fijo-repuestos.service';
import { ItemRepuestoDataDto, ManipularRepuestosDto } from './dto/manipular-repuestos.dto';


export interface FotoData {
    url: string;
  }
  
  export interface RepuestoAsociado {
    repuestoId: number;
    cantidad: number;
    comentario: string;
    precio_unitario: number;
  }
  
  export interface ItemRepuestoData {
    id?: number;
    estado: string;
    comentario?: string;
    fotos?: FotoData[];
    repuestos?: RepuestoAsociado[];
  }
  
  export interface RepuestoDetalle {
    repuestoId: number;
    cantidad: number;
    comentario: string;
    estado?: string;
    precio_unitario: number;
  }
  
  export interface ActivoFijoRepuestosData {
    activoFijoId: number;
    estadoOperativo: string;
    observacionesEstado: string;
    repuestos?: RepuestoDetalle[];
  }
  
  export interface Mediciones {
    medicion_SetPoint?: number;
    medicion_TempInjeccionFrio?: number;
    medicion_TempInjeccionCalor?: number;
    medicion_TempAmbiente?: number;
    medicion_TempRetorno?: number;
    medicion_TempExterior?: number;
  
    medicion_SetPoint_observacion?: string;
    medicion_TempInjeccionFrio_observacion?: string;
    medicion_TempInjeccionCalor_observacion?: string;
    medicion_TempAmbiente_observacion?: string;
    medicion_TempRetorno_observacion?: string;
    medicion_TempExterior_observacion?: string;
  
    consumoCompresor_R?: number;
    consumoCompresor_S?: number;
    consumoCompresor_T?: number;
    consumoCompresor_N?: number;
  
    tension_R_S?: number;
    tension_S_T?: number;
    tension_T_R?: number;
    tension_T_N?: number;
  
    consumo_total_R?: number;
    consumo_total_S?: number;
    consumo_total_T?: number;
    consumo_total_N?: number;
  
    presiones_alta?: number;
    presiones_baja?: number;
  }
  
  export interface ChecklistClimaData {
    activoFijoId: number;
    mediciones: Mediciones;
  }
  
  export interface FinalizarServicioDto {
    firma_cliente?: string;
    repuestos: Record<string, ItemRepuestoData>;
    checklistClima: ChecklistClimaData[];
    activoFijoRepuestos: ActivoFijoRepuestosData[];
  }
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
        @InjectRepository(ItemEstado)
        private itemEstadoRepository: Repository<ItemEstado>,
        private facturacionService: FacturacionService,
        @InjectRepository(Repuesto)
        private repuestoRepository: Repository<Repuesto>,
        @InjectRepository(ItemFotos)
        private itemFotosRepository: Repository<ItemFotos>,
        @InjectRepository(ActivoFijoRepuestos)
        private activoFijoRepuestosRepository: Repository<ActivoFijoRepuestos>,
        @InjectRepository(DetalleRepuestoActivoFijo)
        private detalleRepuestoActivoFijoRepository: Repository<DetalleRepuestoActivoFijo>,
        @InjectRepository(ChecklistClima)
        private checklistClimaRepository: Repository<ChecklistClima>,
        private activoFijoRepuestosService: ActivoFijoRepuestosService
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

        if (solicitud.tecnico_asignado_id_2) {
            solicitudVisita.tecnico_asignado_2 = await this.userRepository.findOne({ 
                where: { id: solicitud.tecnico_asignado_id_2 } 
            });
        }
        
        // Solo validar una visita por mes por local si es de tipo programado o preventivo
        if (solicitudVisita.tipo_mantenimiento === 'programado' &&  solicitudVisita.tipoServicioId === 3) {
            // Obtener las facturaciones del cliente
            const facturacion = await this.facturacionService.listarFacturacionPorCliente(solicitudVisita.client.id);    
            
            // Obtener el mes y año de la fecha de ingreso
            const fechaIngreso = new Date(solicitudVisita.fechaIngreso);
            const mesFormateado = `${this.getMesNombre(fechaIngreso.getMonth())} ${fechaIngreso.getFullYear()}`;
            
            // Buscar el período de facturación por el mes formateado
            const periodoCorrespondiente = facturacion.find(periodo => 
                periodo.mes === mesFormateado
            );

            if (periodoCorrespondiente) {
                // Buscar solicitudes del mismo tipo (programado o preventivo) para el mismo local en el mismo mes
                const solicitudesExistentes = await this.solicitarVisitaRepository.find({
                    where: {
                        local: { id: solicitudVisita.local.id },
                        tipo_mantenimiento: solicitudVisita.tipo_mantenimiento, // Buscar solo del mismo tipo
                        fechaIngreso: Between(
                            new Date(periodoCorrespondiente.fecha_inicio),
                            new Date(periodoCorrespondiente.fecha_termino)
                        )
                    },
                    relations: ['local']
                });

                if (solicitudesExistentes.length > 0) {
                    const solicitudExistente = solicitudesExistentes[0];
                    throw new BadRequestException(
                        `Ya existe una visita de tipo ${solicitudExistente.tipo_mantenimiento} para el local "${solicitudVisita.local.nombre_local}" en ${mesFormateado}. ` +
                        `(Solicitud #${solicitudExistente.id} del ${new Date(solicitudExistente.fechaIngreso).toLocaleDateString()}). ` +
                        `Solo se permite una visita ${solicitudVisita.tipo_mantenimiento} por local por mes.`
                    );
                }
            } else {
                throw new BadRequestException(
                    `No existe un período de facturación configurado para ${mesFormateado}. ` +
                    `Por favor, configure el período antes de crear la solicitud.`
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

    async getSolicitudVisita(id: number): Promise<SolicitarVisita> {
        const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: [
                'local',
                'local.activoFijoLocales',
                'client',
                'checklistsClima',
                'tecnico_asignado',
                'tecnico_asignado_2',
                'itemRepuestos',
                'itemRepuestos.repuesto',
                'itemFotos',
                'causaRaiz',
                'activoFijoRepuestos',
                'activoFijoRepuestos.activoFijo',
                'activoFijoRepuestos.detallesRepuestos',
                'activoFijoRepuestos.detallesRepuestos.repuesto',
                'itemEstados'
            ]
        });

        if (!solicitud) {
            throw new NotFoundException(`Solicitud with ID ${id} not found`);
        }

        return solicitud;
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
            relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Aprobadas]:', JSON.stringify(data, null, 2));
        return data;
    }

//filtrar por fecha que sea la misma del dia actual con la de fechaVisita pero solo dia mes y año no hora min segundos

    async solicitudesPorTecnico(rut: string): Promise<SolicitarVisita[]> {
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
            relations: [
                'local', 
                'local.activoFijoLocales',
                'client', 
                'tecnico_asignado', 
                'tecnico_asignado_2', 
                'activoFijoRepuestos',
                'activoFijoRepuestos.activoFijo',
                'activoFijoRepuestos.detallesRepuestos',
                'activoFijoRepuestos.detallesRepuestos.repuesto'
            ],
            order: { fechaVisita: 'DESC' }
        });
        return data;
    }

    async getSolicitudesRechazadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: SolicitudStatus.RECHAZADA },
            relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2'],
            order: { fechaIngreso: 'DESC' }
        });
        console.log('[Solicitudes Rechazadas]:', JSON.stringify(data, null, 2));
        return data;
    }


  async getSolicitudByIdItems(id: number): Promise<SolicitarVisita> {
    return this.solicitarVisitaRepository.findOne({ 
      where: { id },
      relations: ['itemRepuestos','local','client','tecnico_asignado', 'tecnico_asignado_2']
    });
  }




    async getSolicitudesFinalizadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.FINALIZADA, SolicitudStatus.FINALIZADA]) },
            relations: [
                'local',
                'local.activoFijoLocales',
                'client',
                'tecnico_asignado',
                'tecnico_asignado_2',
                'itemRepuestos',
                'itemRepuestos.repuesto',
                'itemFotos',
                'causaRaiz',
                'activoFijoRepuestos',
                'activoFijoRepuestos.activoFijo',
                'activoFijoRepuestos.detallesRepuestos',
                'activoFijoRepuestos.detallesRepuestos.repuesto'
            ],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }
    
    async getSolicitudesValidadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.VALIDADA, SolicitudStatus.REABIERTA]) },
            relations: [
                'local',
                'local.activoFijoLocales',
                'client',
                'tecnico_asignado',
                'tecnico_asignado_2',
                'itemRepuestos',
                'itemRepuestos.repuesto',
                'itemFotos',
                'causaRaiz',
                'activoFijoRepuestos',
                'activoFijoRepuestos.activoFijo',
                'activoFijoRepuestos.detallesRepuestos',
                'activoFijoRepuestos.detallesRepuestos.repuesto'
            ],
            order: { fechaIngreso: 'DESC' }
        });
        return data;
    }

    async aprovarSolicitudVisita(id: number, data?: { 
        tecnico_asignado_id?: number, 
        tecnico_asignado_id_2?: number,
        aprobada_por_id?: number,
        fechaVisita?: Date,
        especialidad?: string,
        valorPorLocal?: number
    }): Promise<SolicitarVisita> {
       const updateData: any = { 
           status: SolicitudStatus.APROBADA,
           fecha_hora_aprobacion: new Date()
       };
       
       // Si se proporciona un ID de técnico asignado, guardarlo
       if (data?.tecnico_asignado_id) {
           updateData.tecnico_asignado_id = data.tecnico_asignado_id;
       }

       // Si se proporciona un ID de segundo técnico asignado, guardarlo
       if (data?.tecnico_asignado_id_2) {
           updateData.tecnico_asignado_id_2 = data.tecnico_asignado_id_2;
       }
       
       // Si se proporciona un ID de quien aprueba, guardarlo
       if (data?.aprobada_por_id) {
           updateData.aprobada_por_id = data.aprobada_por_id;
       }
       
       // Si se proporciona una fecha de visita, guardarla
       if (data?.fechaVisita) {
           updateData.fechaVisita = data.fechaVisita;
       }
       
       // Si se proporciona una especialidad, guardarla
       if (data?.especialidad) {
           updateData.especialidad = data.especialidad;
       }
       
       // Siempre actualizar valorPorLocal si está definido en data (incluso si es 0)
       if (data?.valorPorLocal !== undefined) {
           console.log('Actualizando valorPorLocal:', data.valorPorLocal);
           updateData.valorPorLocal = data.valorPorLocal;
       }
       
       await this.solicitarVisitaRepository.update(id, updateData);
       
        return this.solicitarVisitaRepository.findOne({ where: { id } });
    }

    async rechazarSolicitudVisita(id: number, data: { motivo: string, rechazada_por_id?: number }): Promise<SolicitarVisita> {
        const updateData: any = { 
            status: SolicitudStatus.RECHAZADA,
            observacion_rechazo: data.motivo
        };
        
        // Si se proporciona un ID de quien rechaza, guardarlo
        if (data.rechazada_por_id) {
            updateData.rechazada_por_id = data.rechazada_por_id;
        }
        
        console.log('Actualizando solicitud con datos:', updateData);
        await this.solicitarVisitaRepository.update(id, updateData);
        
        return this.solicitarVisitaRepository.findOne({ 
            where: { id },
            relations: ['local', 'client', 'tecnico_asignado', 'rechazada_por'] 
        });
    }

    async finalizarSolicitudVisita(id: number): Promise<SolicitarVisita> {
        const solicitud = await this.solicitarVisitaRepository.findOne({ where: { id } });
        if (!solicitud) {
            throw new NotFoundException(`Solicitud with ID ${id} not found`);
        }
        
        solicitud.status = SolicitudStatus.FINALIZADA;
        solicitud.fecha_hora_fin_servicio = new Date();
        await this.solicitarVisitaRepository.save(solicitud);

        return this.solicitarVisitaRepository.findOne({ where: { id }, relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2', 'checklistsClima', 'activoFijoRepuestos', 'activoFijoRepuestos.activoFijo', 'activoFijoRepuestos.detallesRepuestos', 'activoFijoRepuestos.detallesRepuestos.repuesto', 'itemRepuestos', 'itemRepuestos.repuesto', 'itemFotos'] });
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
async finalizarServicio(id: number, data: any): Promise<SolicitarVisita> {

    await this.manipularRepuestosYfotos(id, data);
    await this.manipularChecklistClimaRepuestos(id, data);


    try {
      // 1. Guardar checklist clima
      if (Array.isArray(data.checklistClima)) {
        for (const checklist of data.checklistClima) {
          const mediciones = checklist.mediciones;
  
          const checklistToSave = this.checklistClimaRepository.create({
            solicitudId: id,
            activoFijoId: checklist.activoFijoId,
            ...mediciones,
          });
  
          await this.checklistClimaRepository.save(checklistToSave);
        }
      }
  
      // 2. Guardar activoFijoRepuestos y sus repuestos
      if (Array.isArray(data.activoFijoRepuestos)) {
        for (const activo of data.activoFijoRepuestos) {
          const activoEntity = this.activoFijoRepuestosRepository.create({
                            solicitarVisita: { id },
            activoFijo: { id: activo.activoFijoId },
            estadoOperativo: activo.estadoOperativo,
            observacionesEstado: activo.observacionesEstado,
            fechaRevision: new Date(),
          });
  
          const savedActivo = await this.activoFijoRepuestosRepository.save(activoEntity);
  
          /* if (Array.isArray(activo.repuestos)) {
            for (const repuesto of activo.repuestos) {
              const detalle = this.detalleRepuestoActivoFijoRepository.create({
                activoFijoRepuestos: savedActivo,
                repuesto: { id: repuesto.repuestoId },
                                cantidad: repuesto.cantidad,
                comentario: repuesto.comentario,
                                estado: repuesto.estado || 'pendiente',
                precio_unitario: repuesto.precio_unitario,
              });
  
              await this.detalleRepuestoActivoFijoRepository.save(detalle);
            }
          } */
        }
      }
  
     
  
      // 4. Actualizar solicitud principal
      const solicitudToUpdate = await this.solicitarVisitaRepository.findOne({
        where: { id },
        relations: [
          'local',
          'client',
          'tecnico_asignado',
          'tecnico_asignado_2',
          'checklistsClima',
          'activoFijoRepuestos',
          'activoFijoRepuestos.activoFijo',
          'activoFijoRepuestos.detallesRepuestos',
          'activoFijoRepuestos.detallesRepuestos.repuesto',
          'itemRepuestos',
          'itemRepuestos.repuesto',
          'itemFotos',
        ],
      });
  
      if (!solicitudToUpdate) {
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
      }
  
      solicitudToUpdate.status = SolicitudStatus.FINALIZADA;
      solicitudToUpdate.fecha_hora_fin_servicio = new Date();
  
      const updated = await this.solicitarVisitaRepository.save(solicitudToUpdate);
  
      return updated;
    } catch (error) {
      console.error('❌ Error en finalizarServicio:', error);
      throw new InternalServerErrorException(`Error al finalizar servicio: ${error.message}`);
    }
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


    async validarSolicitud(id: number, validada_por_id: number, causaRaizId?: number): Promise<SolicitarVisita> {
        const visita = await this.solicitarVisitaRepository.findOne({ 
            where: { id },
            relations: ['itemRepuestos', 'causaRaiz']
        });

        if (!visita) {
            throw new NotFoundException(`Visita con ID ${id} no encontrada`);
        }

        // Actualizar los datos de validación
        const updateData = {
            status: SolicitudStatus.VALIDADA,
            validada_por_id: validada_por_id,
            fecha_hora_validacion: new Date(),
            causaRaizId: causaRaizId || null
        };

        // Actualizar la entidad
        await this.solicitarVisitaRepository.save({
            ...visita,
            ...updateData
        });

        // Retornar la entidad actualizada con sus relaciones
        return this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: ['local', 'client', 'tecnico_asignado', 'itemRepuestos', 'itemRepuestos.repuesto', 'causaRaiz']
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
                relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
                order: { id: 'DESC' }
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
                relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
                order: { id: 'ASC' }
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
                relations: ['local', 'client', 'tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
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
            console.log('Updating solicitud with data:', updateSolicitudVisitaDto);
            
            // Convertir campos vacíos a null si son numéricos
            if (updateSolicitudVisitaDto.especialidad === '') {
                updateSolicitudVisitaDto.especialidad = null;
            }
            
            // Ensure causaRaizId is properly handled
            if (updateSolicitudVisitaDto.causaRaizId === '') {
                updateSolicitudVisitaDto.causaRaizId = null;
            }

            // Fetch the existing solicitud with relations
            const solicitud = await this.solicitarVisitaRepository.findOne({
                where: { id },
                relations: ['itemRepuestos', 'causaRaiz']
            });

            if (!solicitud) {
                throw new NotFoundException(`Solicitud with ID ${id} not found`);
            }

            // Update the fields including causaRaizId
            const updateData = {
                ...updateSolicitudVisitaDto,
                causaRaizId: updateSolicitudVisitaDto.causaRaizId || null
            };

            // Save the updated solicitud
            await this.solicitarVisitaRepository.save({
                ...solicitud,
                ...updateData
            });

            // Fetch and return the updated entity with all relations
            const result = await this.solicitarVisitaRepository.findOne({
                where: { id },
                relations: ['itemRepuestos', 'causaRaiz', 'local', 'client', 'tecnico_asignado']
            });

            console.log('Updated solicitud successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating solicitud:', error);
            throw new InternalServerErrorException('Error updating solicitud');
        }
    }



    //asignar un tecnico a una solicitud  puede ser tecnico o tecnico_2 
    async asignarTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
        try {
            const solicitud = await this.solicitarVisitaRepository.findOne({ 
                where: { id: solicitudId },
                relations: ['tecnico_asignado', 'tecnico_asignado_2']
            });

            if (!solicitud) {
                throw new NotFoundException(`Solicitud with ID ${solicitudId} not found`);
            }

        if (tipo === 'tecnico') {
            solicitud.tecnico_asignado_id = tecnicoId;
            } else {
                solicitud.tecnico_asignado_id_2 = tecnicoId; // Corregido el nombre del campo
            }

            const result = await this.solicitarVisitaRepository.save(solicitud);
            
            // Recarga la solicitud con las relaciones para devolver los datos completos
            return await this.solicitarVisitaRepository.findOne({
                where: { id: solicitudId },
                relations: ['tecnico_asignado', 'tecnico_asignado_2']
            });
        } catch (error) {
            console.error('Error al asignar técnico:', error);
            throw new InternalServerErrorException('Error al asignar técnico');
        }
    }

    async changeTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
        try {
            console.log('Changing technician:', { solicitudId, tecnicoId, tipo });
            
            const solicitud = await this.solicitarVisitaRepository.findOne({ 
                where: { id: solicitudId },
                relations: ['tecnico_asignado', 'tecnico_asignado_2']
            });

            if (!solicitud) {
                throw new NotFoundException(`Solicitud with ID ${solicitudId} not found`);
            }

            // Check if the technician is already assigned to the other position
            if (tipo === 'tecnico' && solicitud.tecnico_asignado_id_2 === tecnicoId) {
                throw new BadRequestException('El técnico ya está asignado como técnico 2 en esta solicitud');
            }
            if (tipo === 'tecnico_2' && solicitud.tecnico_asignado_id === tecnicoId) {
                throw new BadRequestException('El técnico ya está asignado como técnico 1 en esta solicitud');
            }

            // Create update object based on tipo
            const updateData = tipo === 'tecnico' 
                ? { tecnico_asignado_id: tecnicoId }
                : { tecnico_asignado_id_2: tecnicoId };

            // Use repository update method
            await this.solicitarVisitaRepository.update(solicitudId, updateData);
            
            // Recargar la solicitud para verificar los cambios
            const updatedSolicitud = await this.solicitarVisitaRepository.findOne({
                where: { id: solicitudId },
                relations: ['tecnico_asignado', 'tecnico_asignado_2']
            });

            console.log('Updated solicitud:', updatedSolicitud);
            return updatedSolicitud;
        } catch (error) {
            console.error('Error changing technician:', error);
            throw error instanceof BadRequestException 
                ? error 
                : new InternalServerErrorException('Error al cambiar técnico: ' + error.message);
        }
    }



async manipularRepuestosYfotos(id: number, data: ManipularRepuestosDto) {
  console.log("◢◤◢◤◢◤ INICIO DE PROCESAMIENTO ◢◤◢◤◢◤");
  console.log('Solicitud ID:', id);
  console.log('Payload recibido:', JSON.stringify(data, null, 2));

  const solicitud = await this.solicitarVisitaRepository.findOne({
    where: { id },
    relations: [
      'itemRepuestos',
      'itemRepuestos.repuesto',
      'itemFotos',
      'client',
      'activoFijoRepuestos',
      'activoFijoRepuestos.activoFijo',
      'activoFijoRepuestos.detallesRepuestos',
      'activoFijoRepuestos.detallesRepuestos.repuesto'
    ]
  });

  if (!solicitud) {
    throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
  }

  for (const [itemId, itemData] of Object.entries(data.repuestos) as [string, ItemRepuestoDataDto][]) {
    console.log(`➡ Procesando item ${itemId}:`, itemData);

    // Guardar fotos si existen
    if (itemData.fotos && itemData.fotos.length > 0) {
      try {
        await this.itemFotosRepository.save({
          solicitarVisitaId: id,
          itemId: parseInt(itemId),
          fotos: itemData.fotos.map(foto => foto.url)
        });
        console.log(`📸 Fotos guardadas para item ${itemId}`);
      } catch (error) {
        console.error('❌ Error al guardar fotos:', error);
        throw new InternalServerErrorException(`Error al guardar fotos: ${error.message}`);
      }
    }

    // Guardar estado y comentario en la nueva tabla ItemEstado
    try {
      await this.itemEstadoRepository.save({
        solicitarVisitaId: id,
        itemId: parseInt(itemId),
        comentario: itemData.comentario || '',
        estado: itemData.estado || 'pendiente'
      });
      console.log(`📄 Estado y comentario guardados para item ${itemId}`);
    } catch (error) {
      console.error(`❌ Error al guardar estado para item ${itemId}:`, error);
      throw new InternalServerErrorException(`Error al guardar estado del item: ${error.message}`);
    }

    // Guardar repuestos solo si existen
    if (Array.isArray(itemData.repuestos) && itemData.repuestos.length > 0) {
      for (const repuestoData of itemData.repuestos) {
        if (!repuestoData.repuesto?.id) {
          console.warn(`⚠️ Repuesto omitido (sin id de repuesto) para item ${itemId}:`, repuestoData);
          continue;
        }

        try {
          const itemRepuesto = this.itemRepuestoRepository.create({
            solicitarVisita: { id },
            itemId: parseInt(itemId),
            repuestoId: repuestoData.repuesto.id,
            cantidad: repuestoData.cantidad,
            comentario: repuestoData.comentario || '',
            estado: 'pendiente'
          });

          await this.itemRepuestoRepository.save(itemRepuesto);
          console.log(`✔ Repuesto guardado para item ${itemId}:`, repuestoData);
        } catch (error) {
          console.error(`❌ Error al guardar repuesto para item ${itemId}:`, error);
          throw new InternalServerErrorException(`Error al guardar repuesto: ${error.message}`);
        }
      }
    } else {
      console.log(`ℹ️ No se encontraron repuestos para item ${itemId}`);
    }
  }

  return await this.solicitarVisitaRepository.findOne({
    where: { id },
    relations: [
      'itemRepuestos',
      'itemRepuestos.repuesto',
      'itemFotos',
      'client',
      'activoFijoRepuestos',
      'activoFijoRepuestos.activoFijo',
      'activoFijoRepuestos.detallesRepuestos',
      'activoFijoRepuestos.detallesRepuestos.repuesto'
    ]
  });
}

    async manipularChecklistClimaRepuestos(id: number, data: FinalizarServicioDto) {
        // Add firma_cliente to solicitud_visita
      /*   if (data.firma_cliente) {
            await this.solicitarVisitaRepository.update(id, {
                firma_cliente: data.firma_cliente
            });
        }
         */
        // Call activoFijoRepuestosService with the correct data
        /* if (data.activoFijoRepuestos && data.activoFijoRepuestos.length > 0) {
            await this.activoFijoRepuestosService.guardarRepuestosActivoFijo(id, {
                activoFijoRepuestos: data.activoFijoRepuestos
            });
        } */
    }

    async manipularItemEstados(id: number, itemEstados: Array<{itemId: number, estado: string, comentario?: string}>) {
        const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: ['itemEstados']
        });

        if (!solicitud) {
            throw new NotFoundException(`Solicitud with ID ${id} not found`);
        }

        // Create new item states
        const itemEstadosToSave = itemEstados.map(estado => {
            const itemEstado = new ItemEstado();
            itemEstado.itemId = estado.itemId;
            itemEstado.solicitarVisitaId = id;
            itemEstado.estado = estado.estado;
            itemEstado.comentario = estado.comentario || '';
            return itemEstado;
        });

        // Save all item states
        await this.itemEstadoRepository.save(itemEstadosToSave);

        return await this.getSolicitudVisita(id);
    }
}

