import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SolicitarVisita, SolicitudStatus } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, ILike, In, Like, Raw, Brackets } from 'typeorm';
import { Client } from 'src/client/client.entity';
import { Locales } from 'src/locales/locales.entity';
import { TipoServicio } from 'src/tipo-servicio/tipo-servicio.entity';
import { User } from 'src/users/users.entity';
import { ItemRepuesto } from 'src/inspection/entities/item-repuesto.entity';
import { ItemEstado } from 'src/inspection/entities/item-estado.entity';

import { FacturacionService } from 'src/facturacion/facturacion.service';
import { Repuesto } from 'src/repuestos/repuestos.entity';
import { ItemFotos } from 'src/inspection/entities/item-fotos.entity';
import { DetalleRepuestoActivoFijo } from '../activo-fijo-repuestos/entities/detalle-repuesto-activo-fijo.entity';
import { ActivoFijoRepuestos } from '../activo-fijo-repuestos/entities/activo-fijo-repuestos.entity';
import { ChecklistClima } from 'src/checklist_clima/checklist_clima.entity';
import { ActivoFijoRepuestosService } from 'src/activo-fijo-repuestos/activo-fijo-repuestos.service';
import { ItemRepuestoDataDto, ManipularRepuestosDto } from './dto/manipular-repuestos.dto';
import { Facturacion } from 'src/facturacion/facturacion.entity';
import { ClienteRepuesto } from 'src/cliente-repuesto/cliente-repuesto.entity';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { format } from 'date-fns';
import { existsSync, readFileSync } from 'fs';



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
        private activoFijoRepuestosService: ActivoFijoRepuestosService,
        @InjectRepository(Facturacion)
        private facturacionRepository: Repository<Facturacion>,
        @InjectRepository(ClienteRepuesto)
        private clienteRepuestoRepository: Repository<ClienteRepuesto>
    ) {}

    /**
     * Crea una nueva solicitud de visita técnica
     * @param solicitud - Objeto con los datos de la solicitud
     * @returns Promise<SolicitarVisita> - Retorna la solicitud creada
     */
    async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
        const solicitudVisita = new SolicitarVisita();
      
        console.log('##############',solicitud);
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
        solicitudVisita.generada_por_id = solicitud.generada_por_id;
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
            throw new BadRequestException(
                `No existe un período de facturación configurado para ${mesFormateado}. ` +
                `Por favor, configure el período antes de crear la solicitud.`
            );
        }

        // Si es mantenimiento programado o preventivo, validar una visita por mes por local
        if (solicitudVisita.tipo_mantenimiento === 'programado' && solicitudVisita.tipoServicioId === 3) {
                const solicitudesExistentes = await this.solicitarVisitaRepository.find({
                    where: {
                        local: { id: solicitudVisita.local.id },
                    tipo_mantenimiento: solicitudVisita.tipo_mantenimiento,
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
        }

        // Asociar el período de facturación a la solicitud
        solicitudVisita.facturacion_id = periodoCorrespondiente.id_facturacion;
        
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


    //necesito un filtro que con una parametro busque por id, nombre de  cliente, nombre de local 

    // necesito buscar por varios parametros que llegaran con este formato
    //['176','juan','santiago']
    //['176']
    //['juan']
    //['santiago']
    //['176','juan']
    //['176','santiago']
    //['juan','santiago']
    //['176','juan','santiago']

    //osea pueden venir n cantidad de parametros 
    async buscarSolicitud(parametros: string[]): Promise<SolicitarVisita[]> {
      try {
        if (!parametros?.length) {
          return [];
        }

        const queryBuilder = this.solicitarVisitaRepository
          .createQueryBuilder('solicitud')
          .leftJoinAndSelect('solicitud.client', 'client')
          .leftJoinAndSelect('solicitud.local', 'local')
          .leftJoinAndSelect('solicitud.tecnico_asignado', 'tecnico_asignado')
          .leftJoinAndSelect('solicitud.tecnico_asignado_2', 'tecnico_asignado_2')
          .leftJoinAndSelect('solicitud.tipoServicio', 'tipoServicio')
          .orderBy('solicitud.fechaIngreso', 'DESC');

        // Procesar cada parámetro de búsqueda
        parametros.forEach((param, i) => {
            const key = `param${i}`;
            queryBuilder.andWhere(new Brackets(qb => {
              qb.where(`CAST(solicitud.id AS CHAR) LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`client.nombre LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`local.nombre_local LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`local.direccion LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`tecnico_asignado.name LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`tecnico_asignado.lastName LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`tecnico_asignado_2.name LIKE :${key}`, { [key]: `%${param}%` })
                .orWhere(`tecnico_asignado_2.lastName LIKE :${key}`, { [key]: `%${param}%` });
            }));
          });

        const solicitudes = await queryBuilder.getMany();
        return solicitudes;

      } catch (error) {
       
        throw new InternalServerErrorException('Error al buscar solicitudes: ' + error.message);
      }
    }


    async getSolicitudVisita(id: number): Promise<SolicitarVisita> {
        const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id: id, estado: true },
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
                'itemEstados',
                'facturacion',
                'generada_por'
            ]
        });

        if (!solicitud) {
            throw new NotFoundException(`Solicitud with ID ${id} not found`);
        }

        return solicitud;
    }


    //obtener solicitudes con paginacion y filtros de cliente, estado, tipo de mantenimiento, mes de facturacion decha desde y fecha hasta puede haber solo un filtro o estar todos los filtros
    //tambien quiero paginacion por la cantidad de solicitudes que vienen
    
    async getSolicitudesVisitaMultifiltro(params: any): Promise<{ data: SolicitarVisita[]; total: number }> {
        const { 
            clienteId, 
            status, 
            tipoMantenimiento, 
            mesFacturacion, 
            fechaDesde, 
            fechaHasta,
            page = 1,
            limit = 10
        } = params;

        try {
            const queryBuilder = this.solicitarVisitaRepository
                .createQueryBuilder('solicitud')
                .select([
                    'solicitud.id',
                    'solicitud.fechaIngreso',
                    'solicitud.tipo_mantenimiento',
                    'solicitud.status',
                    'local.id',
                    'local.nombre_local',
                    'client.id',
                    'client.nombre',
                    'tecnico_asignado.name',
                    'tecnico_asignado.lastName',
                    'facturacion.mes',
                    'solicitud.fechaVisita'
                ])
                .leftJoin('solicitud.local', 'local')
                .leftJoin('solicitud.client', 'client')
                .leftJoin('solicitud.tecnico_asignado', 'tecnico_asignado')
                .leftJoin('solicitud.facturacion', 'facturacion')
                .where('solicitud.estado = :estado', { estado: true })
                .orderBy('solicitud.id', 'DESC');

            if (clienteId) {
                queryBuilder.andWhere('client.id = :clienteId', { clienteId });
            }

            if (status) {
                queryBuilder.andWhere('solicitud.status = :status', { status });
            }

            if (tipoMantenimiento) {
                queryBuilder.andWhere('solicitud.tipo_mantenimiento = :tipoMantenimiento', { tipoMantenimiento });
            }

            if (mesFacturacion) {
                queryBuilder.andWhere('facturacion.mes = :mesFacturacion', { mesFacturacion });
            }

            if (fechaDesde) {
                const fechaDesdeObj = new Date(fechaDesde);
                fechaDesdeObj.setHours(0, 0, 0, 0);
                queryBuilder.andWhere('solicitud.fechaIngreso >= :fechaDesde', { fechaDesde: fechaDesdeObj });
            }

            if (fechaHasta) {
                const fechaHastaObj = new Date(fechaHasta);
                fechaHastaObj.setHours(23, 59, 59, 999);
                queryBuilder.andWhere('solicitud.fechaIngreso <= :fechaHasta', { fechaHasta: fechaHastaObj });
            }

            const total = await queryBuilder.getCount();

            queryBuilder
                .skip((page - 1) * limit)
                .take(limit);

            const solicitudes = await queryBuilder.getMany();

            return {
                data: solicitudes,
                total
            };
        } catch (error) {
            console.error('Error en getSolicitudesVisitaMultifiltro:', error);
            throw new Error('Error al obtener las solicitudes de visita');
        }
    }
    
    async deleteSolicitud(id){
       //modificar el estado a 0 para eliminar 
        await this.solicitarVisitaRepository.update(id, { estado: false });

    }

    getSolicitudesVisita(): Promise<SolicitarVisita[]> {
        return this.solicitarVisitaRepository.find({ 
          where: {  estado: true  },
          relations: ['local', 'client', 'tecnico_asignado', 'generada_por' ,'facturacion'],
          order: { fechaIngreso: 'DESC' }
        });
    }

    async getSolicitudesAprobadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.APROBADA, SolicitudStatus.APROBADA]) , estado: true},
            relations: ['local', 'generada_por', 'client', 'tecnico_asignado', 'tecnico_asignado_2'],
            order: { fechaIngreso: 'DESC' }
        });
      
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
                estado: true,
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
            relations: ['local', 'client', 'tecnico_asignado', 'generada_por','rechazada_por', 'tecnico_asignado_2'],
            order: { fechaIngreso: 'DESC' }
        });
      
        return data;
    }


  async getSolicitudByIdItems(id: number): Promise<SolicitarVisita> {
    return this.solicitarVisitaRepository.findOne({ 
      where: { id },
      relations: ['itemRepuestos','local','client','tecnico_asignado', 'tecnico_asignado_2']
    });
  }

async getSolicitudesAtendidasProceso():Promise<SolicitarVisita[]>{
    const data = await this.solicitarVisitaRepository.find({ 
        where: { status: In([SolicitudStatus.ATENDIDA_EN_PROCESO]), estado: true },
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
            'activoFijoRepuestos.detallesRepuestos.repuesto',
            'generada_por'
        ],
        order: { id: 'DESC' }
    });
    return data;
}


    async getSolicitudesFinalizadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository.find({ 
            where: { status: In([SolicitudStatus.FINALIZADA, SolicitudStatus.FINALIZADA]), estado: true },
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
                'activoFijoRepuestos.detallesRepuestos.repuesto',
                'generada_por'
            ],
            order: { id: 'DESC' }
        });
        return data;
    }
    
    async getSolicitudesValidadas(): Promise<SolicitarVisita[]> {
        const data = await this.solicitarVisitaRepository
            .createQueryBuilder('solicitud')
            .leftJoinAndSelect('solicitud.local', 'local')
            .leftJoinAndSelect('local.activoFijoLocales', 'activoFijoLocales')
            .leftJoinAndSelect('solicitud.client', 'client')
            .leftJoinAndSelect('solicitud.tecnico_asignado', 'tecnico_asignado')
            .leftJoinAndSelect('solicitud.tecnico_asignado_2', 'tecnico_asignado_2')
            .leftJoinAndSelect('solicitud.itemRepuestos', 'itemRepuestos')
            .leftJoinAndSelect('itemRepuestos.repuesto', 'repuesto')
            .leftJoinAndSelect('solicitud.itemFotos', 'itemFotos')
            .leftJoinAndSelect('solicitud.causaRaiz', 'causaRaiz')
            .leftJoinAndSelect('solicitud.generada_por', 'generada_por')
            .leftJoinAndSelect('solicitud.activoFijoRepuestos', 'activoFijoRepuestos')
            .leftJoinAndSelect('activoFijoRepuestos.activoFijo', 'activoFijo')
            .leftJoinAndSelect('activoFijoRepuestos.detallesRepuestos', 'detallesRepuestos')
            .leftJoinAndSelect('detallesRepuestos.repuesto', 'detallesRepuesto')
            .leftJoin('solicitud.validada_por', 'validada_por')
            .addSelect(['validada_por.id', 'validada_por.name', 'validada_por.lastName'])
            .where({
                status: In([SolicitudStatus.VALIDADA, SolicitudStatus.REABIERTA]),
                estado: true
            })
            .orderBy('solicitud.fechaIngreso', 'DESC')
            .getMany();

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
    async getPendientes(): Promise<SolicitarVisita[]> {
        const pendientes = await this.solicitarVisitaRepository.find({
            where: { 
                status: SolicitudStatus.PENDIENTE, 
                estado: true 
            },
            relations: [
                'local',
                'client',
                'tecnico_asignado',
                'tecnico_asignado_2',
                'checklistsClima',
                'itemRepuestos',
                'itemFotos',
                'causaRaiz',
                'activoFijoRepuestos',
                'itemEstados',
                'facturacion',
                'generada_por'
            ],
            order: { 
                id: 'DESC' 
            }
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


    async validarSolicitud(id: number, validada_por_id: number, causaRaizId?: number, garantia?: string, turno?: string, estado_solicitud?: string, image_ot?: string): Promise<SolicitarVisita> {
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
            causaRaizId: causaRaizId || null,
            garantia: garantia || '',
            turno: turno || '',
            estado_solicitud: estado_solicitud || '',
            image_ot: image_ot || ''
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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día (00:00:00)
        
        const endOfDayPlusFourHours = new Date(today);
        endOfDayPlusFourHours.setHours(28, 0, 0, 0); // Fin del día + 4 horas (04:00:00 del día siguiente)
        
        try {
            const data = await this.solicitarVisitaRepository.find({ 
                where: { 
                    status: In([
                        SolicitudStatus.VALIDADA, 
                        SolicitudStatus.REABIERTA,
                        SolicitudStatus.EN_SERVICIO,
                        SolicitudStatus.FINALIZADA, 
                        SolicitudStatus.APROBADA,
                        SolicitudStatus.ATENDIDA_EN_PROCESO 
                    ]),
                    estado: true,
                    fechaVisita: Between(today, endOfDayPlusFourHours)
                },
                relations: ['local', 'client', 'generada_por', 'tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
                order: { id: 'DESC' }
            });
    
            return data || [];
        } catch (error) {
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
        try {
            const whereClause: any = {
                status: In([
                   SolicitudStatus.VALIDADA, 
                    SolicitudStatus.REABIERTA,
                    SolicitudStatus.EN_SERVICIO,
                    SolicitudStatus.FINALIZADA, 
                    SolicitudStatus.APROBADA,
                    SolicitudStatus.ATENDIDA_EN_PROCESO 
                  /*   SolicitudStatus.RECHAZADA,
                    SolicitudStatus.PENDIENTE */
                ]),
                estado: true
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
                const startDate = new Date(this.parseFecha(fechaInicio));
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(this.parseFecha(fechaFin));
                endDate.setHours(23, 59, 59, 999);

              
                whereClause.fechaIngreso = Between(startDate, endDate);
            } else if (tipoBusqueda === 'mesFacturacion' && mesFacturacion) {
                // Buscar la facturación directamente por el mes
                const facturaciones = await this.facturacionRepository.find({
                    where: {
                        mes: ILike(`%${mesFacturacion}%`)
                    }
                });

               

                if (facturaciones.length > 0) {
                    whereClause.facturacion = { 
                        id_facturacion: In(facturaciones.map(f => f.id_facturacion)) 
                    };
                } else {
                   
                    return [];
                }
            }

            // Add tipo_mantenimiento filter if provided
            if (tipo_mantenimiento && tipo_mantenimiento !== 'todos') {
                whereClause.tipo_mantenimiento = tipo_mantenimiento;
            }

         

            const data = await this.solicitarVisitaRepository.find({ 
                where: whereClause,
                relations: ['local', 'client', 'generada_por','facturacion', 'tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
                order: { id: 'ASC' }
            });

         
            return data || [];
        } catch (error) {
            
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
       
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
        
    
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
                        SolicitudStatus.ATENDIDA_EN_PROCESO 
                    ]),
                    estado: true,
                    
                    fechaIngreso: Between(today, tomorrow)
                },
                relations: ['local', 'client', 'generada_por','tecnico_asignado', 'tecnico_asignado_2', 'tipoServicio'],
                order: { fechaIngreso: 'DESC' } 
            });

        

            return data || [];
        } catch (error) {
           
            throw error;
        }
    }

    async update(id: number, updateSolicitudVisitaDto: any) {
        try {
        
            
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

           
            return result;
        } catch (error) {
         
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
        
            throw new InternalServerErrorException('Error al asignar técnico');
        }
    }

    async changeTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
        try {
          
            
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

        
            return updatedSolicitud;
        } catch (error) {
          
            throw error instanceof BadRequestException 
                ? error 
                : new InternalServerErrorException('Error al cambiar técnico: ' + error.message);
        }
    }



    async manipularRepuestosYfotos(id: number, data: ManipularRepuestosDto) {


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
     

        // Guardar fotos si existen
        if (itemData.fotos && itemData.fotos.length > 0) {
        try {
            // Filtrar las URLs nulas o vacías
            const fotosValidas = itemData.fotos.filter(foto => {
            const url = typeof foto === 'string' ? foto : foto?.url;
            return url && typeof url === 'string' && url.trim().length > 0;
            });
            
            if (fotosValidas.length > 0) {
            await this.itemFotosRepository.save({
                solicitarVisita: { id },
                itemId: parseInt(itemId),
                fotos: fotosValidas.map(foto => typeof foto === 'string' ? foto : foto.url)
            });
          
            }
        } catch (error) {
          
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
     
        } catch (error) {
    
        throw new InternalServerErrorException(`Error al guardar estado del item: ${error.message}`);
        }

        // Guardar repuestos con precios específicos del cliente
        if (Array.isArray(itemData.repuestos) && itemData.repuestos.length > 0) {
            for (const repuestoData of itemData.repuestos) {
                if (!repuestoData.repuesto?.id) {
                    
                    continue;
                }

                try {
                    // Obtener el repuesto base
                    const repuesto = await this.repuestoRepository.findOne({
                        where: { id: repuestoData.repuesto.id }
                    });

                    if (!repuesto) {
                        throw new NotFoundException(`Repuesto with ID ${repuestoData.repuesto.id} not found`);
                    }

                    // Inicializar precios con los valores base del repuesto
                    let precioVenta = parseFloat(repuesto.precio_venta.toString());
                    let precioCompra = parseFloat(repuesto.precio_compra.toString());

                    // Buscar precios específicos del cliente si existe
                    if (solicitud.client?.id) {
                        const precioCliente = await this.clienteRepuestoRepository.findOne({
                            where: {
                                cliente_id: solicitud.client.id,
                                repuesto_id: repuesto.id
                            }
                        });

                        if (precioCliente) {
                            precioVenta = parseFloat(precioCliente.precio_venta.toString());
                            precioCompra = parseFloat(precioCliente.precio_compra.toString());
                        }
                    }

                    // Verificar que los precios sean números válidos
                    if (isNaN(precioVenta)) precioVenta = 0;
                    if (isNaN(precioCompra)) precioCompra = 0;

                    const itemRepuesto = this.itemRepuestoRepository.create({
                        solicitarVisita: { id },
                        itemId: parseInt(itemId),
                        repuestoId: repuestoData.repuesto.id,
                        cantidad: repuestoData.cantidad,
                        comentario: repuestoData.comentario || '',
                        estado: 'pendiente',
                        precio_venta: precioVenta,
                        precio_compra: precioCompra
                    });

                    await this.itemRepuestoRepository.save(itemRepuesto);
                   
                } catch (error) {
                   
                    throw new InternalServerErrorException(`Error al guardar repuesto: ${error.message}`);
                }
            }
        } else {
         
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
      
        
        try {
            // Add firma_cliente to solicitud_visita
            if (data.firma_cliente) {
                await this.solicitarVisitaRepository.update(id, {
                    firma_cliente: data.firma_cliente
                });
            }
            
            // Filtrar activoFijoRepuestos que tengan repuestos
            if (data.activoFijoRepuestos?.length > 0) {
                const activoFijoRepuestosConRepuestos = data.activoFijoRepuestos.filter(
                    activo => activo.repuestos && activo.repuestos.length > 0
                );

                if (activoFijoRepuestosConRepuestos.length > 0) {
                    await this.activoFijoRepuestosService.guardarRepuestosActivoFijo(id, {
                        activoFijoRepuestos: activoFijoRepuestosConRepuestos
                    });
                }
            }

            // Retornar la solicitud actualizada
            return await this.solicitarVisitaRepository.findOne({
                where: { id },
                relations: [
                    'activoFijoRepuestos',
                    'activoFijoRepuestos.activoFijo',
                    'activoFijoRepuestos.detallesRepuestos',
                    'activoFijoRepuestos.detallesRepuestos.repuesto'
                ]
            });

        } catch (error) {
       
            throw new InternalServerErrorException(
                `Error al procesar checklist clima y repuestos: ${error.message}`
            );
        }
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

    async asociarConMesFacturacion(solicitudId: number, facturacionId: number): Promise<SolicitarVisita> {
        const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id: solicitudId },
            relations: ['facturacion']
        });

        if (!solicitud) {
            throw new NotFoundException(`Solicitud de visita con ID ${solicitudId} no encontrada`);
        }

        const facturacion = await this.facturacionRepository.findOne({
            where: { id_facturacion: facturacionId }
        });

        if (!facturacion) {
            throw new NotFoundException(`Mes de facturación con ID ${facturacionId} no encontrado`);
        }

        // Asociar la solicitud con el mes de facturación
        solicitud.facturacion_id = facturacionId;
        
        return this.solicitarVisitaRepository.save(solicitud);
    }

    async generatePdf(id: number): Promise<Buffer> {
        try {
          const solicitud = await this.solicitarVisitaRepository.findOne({
            where: { id },
            relations: [
              'local', 'local.activoFijoLocales', 'client', 'tecnico_asignado', 'tecnico_asignado_2',
              'itemRepuestos', 'itemRepuestos.repuesto', 'itemFotos', 'causaRaiz',
              'activoFijoRepuestos', 'activoFijoRepuestos.activoFijo', 'activoFijoRepuestos.detallesRepuestos',
              'activoFijoRepuestos.detallesRepuestos.repuesto']
          });
          if (!solicitud) throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
      
          const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
          const buffers: Buffer[] = [];
          doc.on('data', buffers.push.bind(buffers));
          let finalBuffer: Buffer | null = null;
          doc.on('end', () => finalBuffer = Buffer.concat(buffers));
      
          const pageWidth = doc.page.width;
          const marginLeft = 50;
      
          // Header: Logo + Title + Data
          const logoPath = existsSync(join(__dirname, '..', '..', 'src', 'images', 'atlantis_logo.jpg'))
            ? join(__dirname, '..', '..', 'src', 'images', 'atlantis_logo.jpg')
            : join(__dirname, '..', 'images', 'atlantis_logo.jpg');
          try {
            if (existsSync(logoPath)) {
              doc.image(logoPath, marginLeft, 40, { width: 60 });
            }
          } catch {}
      
          doc.font('Helvetica-Bold').fontSize(20).text('ATLANTIS', marginLeft + 80, 50);
          doc.font('Helvetica').fontSize(10)
            .text(`N° Solicitud: ${solicitud.id}`, marginLeft + 80, 75)
            .text(`Inicio: ${format(new Date(solicitud.fecha_hora_inicio_servicio), 'dd/MM/yyyy HH:mm')}`, marginLeft + 80, 90)
            .text(`Término: ${format(new Date(solicitud.fecha_hora_fin_servicio), 'dd/MM/yyyy HH:mm')}`, marginLeft + 80, 105);
      
          doc.moveTo(marginLeft, 130).lineTo(pageWidth - marginLeft, 130).stroke();
          doc.moveDown(2);
      
          // Información general
          doc.font('Helvetica-Bold').fontSize(12).text('DESCRIPCIÓN GENERAL DE LA SOLICITUD', marginLeft, undefined, { underline: true });
          doc.moveDown(1);
      
          const tecnico1 = solicitud.tecnico_asignado;
          const tecnico2 = solicitud.tecnico_asignado_2;
      
          const nombreTecnicos = [
            tecnico1 ? `${tecnico1.name} ${tecnico1.lastName || ''}`.trim() : null,
            tecnico2 ? `${tecnico2.name} ${tecnico2.lastName || ''}`.trim() : null
          ].filter(Boolean).join(' y ') || 'No especificado';
      
          const info = [
            [`CLIENTE`, solicitud.client?.nombre],
            [`LOCAL`, solicitud.local?.nombre_local],
            [`DIRECCIÓN`, solicitud.local?.direccion],
            [`EQUIPO A INTERVENIR`, solicitud.observaciones || 'No especificado'],
            [`TIPO DE SERVICIO`, solicitud.tipo_mantenimiento],
            [`TÉCNICO EJECUTANTE`, nombreTecnicos]
          ];
      
          doc.fontSize(10);
          info.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(`${label}: `, marginLeft, undefined, { continued: true })
               .font('Helvetica').text(value || '');
          });
      
          // Firma
          doc.moveDown(3);
          doc.fontSize(11).font('Helvetica-Bold').text('Firma del Cliente:', marginLeft);
          if (solicitud.firma_cliente) {
            try {
              const signatureBuffer = Buffer.from(solicitud.firma_cliente.replace(/^data:image\/\w+;base64,/, ''), 'base64');
              doc.image(signatureBuffer, marginLeft, doc.y + 10, { width: 180, height: 90 });
              doc.moveDown(5);
            } catch {
              doc.font('Helvetica').text('Firma no disponible', marginLeft);
            }
          }
          doc.fontSize(10).text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, marginLeft);
      
          // Repuestos utilizados
          const repuestos = solicitud.itemRepuestos?.map(r => `- ${r.repuesto.familia}: ${r.repuesto.articulo} (${r.repuesto.marca})`).join('\n');
          if (repuestos) {
            doc.addPage();
            doc.fontSize(12).font('Helvetica-Bold').text('REPUESTOS UTILIZADOS', marginLeft, undefined, { underline: true });
            doc.moveDown();
            doc.font('Helvetica').fontSize(10).text(repuestos, marginLeft);
          }
      
          // Fotografías
          const hasPhotos = solicitud.itemFotos?.some(f => f.fotos?.length);
          if (hasPhotos) {
            doc.addPage();
            doc.fontSize(14).font('Helvetica-Bold').text('REGISTRO FOTOGRÁFICO', marginLeft, undefined, { underline: true });
      
            let y = 80, x = marginLeft;
            const imageWidth = 120, imageHeight = 90, gap = 15;
      
            for (const item of solicitud.itemFotos) {
              if (!item.fotos?.length) continue;
              doc.fontSize(11).font('Helvetica-Bold').text(`Item ${item.itemId}`, x, y);
              y += 15;
              for (const fotoUrl of item.fotos) {
                try {
                  const filename = fotoUrl.split('/uploads/')[1];
                  const path = join(process.cwd(), 'uploads', filename);
                  if (!existsSync(path)) throw new Error(`No existe: ${path}`);
      
                  if (x + imageWidth > pageWidth - marginLeft) {
                    x = marginLeft;
                    y += imageHeight + gap;
                  }
                  if (y + imageHeight > doc.page.height - 60) {
                    doc.addPage();
                    y = 60; x = marginLeft;
                  }
                  doc.rect(x, y, imageWidth, imageHeight).stroke();
                  doc.image(path, x, y, { fit: [imageWidth, imageHeight] });
                  x += imageWidth + gap;
                } catch (err) {
                  doc.font('Helvetica').fontSize(8).text(`Error imagen: ${err.message}`, x, y);
                  x += imageWidth + gap;
                }
              }
              y += imageHeight + gap * 2;
              x = marginLeft;
            }
          }
      
          doc.end();
          return new Promise((resolve, reject) => {
            doc.on('end', () => finalBuffer ? resolve(finalBuffer) : reject(new Error('PDF vacío')));
          });
        } catch (err) {
          throw new InternalServerErrorException(`Error generando PDF: ${err.message}`);
        }
      }

      async subirCargaMasiva(datos: any[]): Promise<SolicitarVisita[]> {
        const solicitudesCreadas: any[] = [];

        try {
            for (const dato of datos) {
                // Validar que exista el local
                const local = await this.localesRepository.findOne({
                    where: { id: dato.localId }
                });
                if (!local) {
                    throw new NotFoundException(`Local con ID ${dato.localId} no encontrado`);
                }

                // Validar que exista el cliente
                const cliente = await this.clientRepository.findOne({
                    where: { id: dato.clienteId }
                });
                if (!cliente) {
                    throw new NotFoundException(`Cliente con ID ${dato.clienteId} no encontrado`);
                }

                // Crear la nueva solicitud
                const nuevaSolicitud = this.solicitarVisitaRepository.create({
                    client: cliente,
                    local: local,
                    fecha_hora_inicio_servicio: new Date(dato.fechaVisita),
                    tecnico_asignado_id: dato.tecnico1Id,
                    tecnico_asignado_id_2: dato.tecnico2Id,
                    tipoServicioId: dato.tipoServicioId,
                    sectorTrabajoId: dato.sectorTrabajoId,
                    generada_por_id: dato.generada_por_id,
                    aprobada_por_id: dato.aprobada_por_id,
                    tipo_mantenimiento: dato.tipo_mantenimiento,
                    status: dato.status,
                    facturacion_id: dato.facturacion_id,
                    observaciones: 'Solicitud generada por carga masiva',
                    fechaVisita: new Date(dato.fechaVisita)
                });

                // Guardar la solicitud
                const solicitudGuardada = await this.solicitarVisitaRepository.save(nuevaSolicitud);
                solicitudesCreadas.push(solicitudGuardada);

               
            }

            return solicitudesCreadas;

        } catch (error) {
          
            throw new InternalServerErrorException(
                `Error al procesar carga masiva: ${error.message}`
            );
        }
    }   
     async cambiarEstadoSolicitud(id, status){
            this.solicitarVisitaRepository.update(id, { status })
     }       
}

