import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { SolicitarVisita, SolicitudStatus } from './solicitar-visita.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  Not,
  ILike,
  In,
  Like,
  Raw,
  Brackets,
  QueryBuilder,
} from 'typeorm';
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
import { Sla } from '../sla/entity/sla.entity';
import { ActivoFijoRepuestosService } from 'src/activo-fijo-repuestos/activo-fijo-repuestos.service';
import {
  ItemRepuestoDataDto,
  ManipularRepuestosDto,
} from './dto/manipular-repuestos.dto';
import { Facturacion } from 'src/facturacion/facturacion.entity';
import { ClienteRepuesto } from 'src/cliente-repuesto/cliente-repuesto.entity';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { format } from 'date-fns';
import { existsSync, readFileSync } from 'fs';
import { Item } from 'src/inspection/entities/item.entity';
import { Section } from 'src/inspection/entities/section.entity';
import * as sgMail from '@sendgrid/mail';
import * as https from 'https';
import * as http from 'http';
import { Readable } from 'stream';
import { ResponseChecklist } from 'src/inspection/entities/response-checklist.entity';

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

interface ImageDownloadResult {
  success: boolean;
  data?: Buffer;
  error?: string;
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
    @InjectRepository(Sla)
    private slaRepository: Repository<Sla>,
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
    private clienteRepuestoRepository: Repository<ClienteRepuesto>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(ResponseChecklist)
    private responseChecklistRepository: Repository<ResponseChecklist>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  /**
   * Crea una nueva solicitud de visita técnica
   * @param solicitud - Objeto con los datos de la solicitud
   * @returns Promise<SolicitarVisita> - Retorna la solicitud creada
   */
  async crearSolicitudVisita(solicitud: any): Promise<SolicitarVisita> {
    const solicitudVisita = new SolicitarVisita();

    console.log('##############', solicitud);
    // Busca y asigna el tipo de servicio seleccionado
    const tipoServicio = await this.tipoServicioRepository.findOne({
      where: { id: solicitud.tipoServicioId },
    });
    solicitudVisita.tipoServicioId = tipoServicio.id;

    // Busca y asigna el tipo de solicitud (SLA) seleccionado
    if (solicitud.tipoSolicitudId) {
      const tipoSolicitud = await this.slaRepository.findOne({
        where: { id: solicitud.tipoSolicitudId },
      });
      if (tipoSolicitud) {
        solicitudVisita.tipoSolicitudId = tipoSolicitud.id;
      }
    }

    // Busca y asigna el local y cliente relacionados
    solicitudVisita.local = await this.localesRepository.findOne({
      where: { id: solicitud.localId },
    });
    solicitudVisita.client = await this.clientRepository.findOne({
      where: { id: solicitud.clientId },
    });

    // Asigna los datos básicos de la solicitud
    solicitudVisita.sectorTrabajoId = solicitud.sectorTrabajoId;
    solicitudVisita.especialidad = solicitud.especialidad;
    solicitudVisita.ticketGruman = solicitud.ticketGruman;
    solicitudVisita.observaciones = solicitud.observaciones;
    solicitudVisita.fechaIngreso = solicitud.fechaIngreso;
    solicitudVisita.fechaVisita = solicitud.fechaVisita;
    solicitudVisita.imagenes = solicitud.imagenes;
    solicitudVisita.tipo_mantenimiento = solicitud.tipo_mantenimiento;
    solicitudVisita.generada_por_id = solicitud.generada_por_id;
    // Asigna el técnico si fue especificado
    if (solicitud.tecnico_asignado_id) {
      solicitudVisita.tecnico_asignado = await this.userRepository.findOne({
        where: { id: solicitud.tecnico_asignado_id },
      });
    }

    if (solicitud.tecnico_asignado_id_2) {
      solicitudVisita.tecnico_asignado_2 = await this.userRepository.findOne({
        where: { id: solicitud.tecnico_asignado_id_2 },
      });
    }

    // Obtener las facturaciones del cliente
    const facturacion =
      await this.facturacionService.listarFacturacionPorCliente(
        solicitudVisita.client.id,
      );

    // Obtener el mes y año de la fecha de ingreso
    const fechaIngreso = new Date(solicitudVisita.fechaIngreso);
    const mesFormateado = `${this.getMesNombre(fechaIngreso.getMonth())} ${fechaIngreso.getFullYear()}`;

    // Buscar el período de facturación por el mes formateado
    const periodoCorrespondiente = facturacion.find(
      (periodo) => periodo.mes === mesFormateado,
    );

    if (!periodoCorrespondiente) {
      throw new BadRequestException(
        `No existe un período de facturación configurado para ${mesFormateado}. ` +
          `Por favor, configure el período antes de crear la solicitud.`,
      );
    }

    // Si es mantenimiento programado o preventivo, validar una visita por mes por local
    if (
      solicitudVisita.tipo_mantenimiento === 'programado' &&
      solicitudVisita.tipoServicioId === 3
    ) {
      const solicitudesExistentes = await this.solicitarVisitaRepository.find({
        where: {
          local: { id: solicitudVisita.local.id },
          estado: true,
          tipo_mantenimiento: solicitudVisita.tipo_mantenimiento,
          fechaIngreso: Between(
            new Date(periodoCorrespondiente.fecha_inicio),
            new Date(periodoCorrespondiente.fecha_termino),
          ),
        },
        relations: ['local'],
      });

      if (solicitudesExistentes.length > 0) {
        const solicitudExistente = solicitudesExistentes[0];
        throw new BadRequestException(
          `Ya existe una visita de tipo ${solicitudExistente.tipo_mantenimiento} para el local "${solicitudVisita.local.nombre_local}" en ${mesFormateado}. ` +
            `(Solicitud #${solicitudExistente.id} del ${new Date(solicitudExistente.fechaIngreso).toLocaleDateString()}). ` +
            `Solo se permite una visita ${solicitudVisita.tipo_mantenimiento} por local por mes.`,
        );
      }
    }

    // Asociar el período de facturación a la solicitud
    solicitudVisita.facturacion_id = periodoCorrespondiente.id_facturacion;

    // Si la solicitud está aprobada, asigna el aprobador
    if (solicitud.status === 'aprobada' && solicitud.aprobada_por_id) {
      solicitudVisita.status = SolicitudStatus.APROBADA;
      solicitudVisita.aprobada_por = await this.userRepository.findOne({
        where: { id: solicitud.aprobada_por_id },
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
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(`CAST(solicitud.id AS CHAR) LIKE :${key}`, {
              [key]: `%${param}%`,
            })
              .orWhere(`client.nombre LIKE :${key}`, { [key]: `%${param}%` })
              .orWhere(`local.nombre_local LIKE :${key}`, {
                [key]: `%${param}%`,
              })
              .orWhere(`local.direccion LIKE :${key}`, { [key]: `%${param}%` })
              .orWhere(`tecnico_asignado.name LIKE :${key}`, {
                [key]: `%${param}%`,
              })
              .orWhere(`tecnico_asignado.lastName LIKE :${key}`, {
                [key]: `%${param}%`,
              })
              .orWhere(`tecnico_asignado_2.name LIKE :${key}`, {
                [key]: `%${param}%`,
              })
              .orWhere(`tecnico_asignado_2.lastName LIKE :${key}`, {
                [key]: `%${param}%`,
              });
          }),
        );
      });

      const solicitudes = await queryBuilder.getMany();
      return solicitudes;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar solicitudes: ' + error.message,
      );
    }
  }

  async getSolicitudVisita(id: number): Promise<SolicitarVisita> {
    // Consulta base con relaciones esenciales
    const solicitudBase = await this.solicitarVisitaRepository.findOne({
      where: { id: id, estado: true },
      select: {
        local: {
          id: true,
          direccion: true,
          nombre_local: true,
          email_local: true,
          email_encargado: true,
          nombre_encargado: true,
          latitud: true,
          longitud: true,
          sobreprecio: true,
          valorPorLocal: true,
          numeroLocal: true,
        },
        client: {
          id: true,
          nombre: true,
          rut: true,
          razonSocial: true,
          sobreprecio: true,
          valorPorLocal: true,
          fechaAlta: true,
          listaInspeccion: true,
        },
        tecnico_asignado: {
          id: true,
          name: true,
          lastName: true,
          rut: true,
          profile: true,
        },
        tecnico_asignado_2: {
          id: true,
          name: true,
          lastName: true,
          rut: true,
          profile: true,
        },
        facturacion: {
          id_facturacion: true,
          mes: true,
        },
        generada_por: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          rut: true,
        },
        tipo_servicio: {
          id: true,
          nombre: true,
        },
      },
      relations: [
        'local',
        'client',
        'tecnico_asignado',
        'tecnico_asignado_2',
        'generada_por',
        'facturacion',
        'tipo_servicio',
      ],
    });

    if (!solicitudBase) {
      throw new NotFoundException(`Solicitud with ID ${id} not found`);
    }

    // Cargar relaciones adicionales en consultas separadas
    const [
      checklistsClima,
      itemRepuestos,
      itemFotos,
      causaRaiz,
      activoFijoRepuestos,
      itemEstados,
      facturacion,
      activoFijoLocales,
    ] = await Promise.all([
      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.checklistsClima', 'checklistsClima')
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.itemRepuestos', 'itemRepuestos')
        .leftJoinAndSelect('itemRepuestos.repuesto', 'repuesto')
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.itemFotos', 'itemFotos')
        .where('solicitud.id = :id', { id })
        .orderBy('itemFotos.id', 'DESC')
        .limit(1)
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.causaRaiz', 'causaRaiz')
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect(
          'solicitud.activoFijoRepuestos',
          'activoFijoRepuestos',
        )
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.itemEstados', 'itemEstados')
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.facturacion', 'facturacion')
        .where('solicitud.id = :id', { id })
        .getOne(),

      this.solicitarVisitaRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.local', 'local')
        .leftJoinAndSelect('local.activoFijoLocales', 'activoFijoLocales')
        .where('solicitud.id = :id', { id })
        .getOne(),
    ]);

    return {
      ...solicitudBase,
      checklistsClima: checklistsClima?.checklistsClima || [],
      itemRepuestos: itemRepuestos?.itemRepuestos || [],
      itemFotos: itemFotos?.itemFotos || [],
      causaRaiz: causaRaiz?.causaRaiz || null,
      activoFijoRepuestos: activoFijoRepuestos?.activoFijoRepuestos || [],
      itemEstados: itemEstados?.itemEstados || [],
      facturacion: facturacion?.facturacion || null,
      local: {
        ...solicitudBase.local,
        activoFijoLocales: activoFijoLocales?.local?.activoFijoLocales || [],
      },
    };
  }
  async getSolicitudVisitaClima(id: number): Promise<SolicitarVisita> {
    // Consulta base con relaciones esenciales
    const solicitudBase = await this.solicitarVisitaRepository.findOne({
      select: {
        client: {
          id: true,
          nombre: true,
          rut: true,
          razonSocial: true,
          sobreprecio: true,
          valorPorLocal: true,
          fechaAlta: true,
          listaInspeccion: true,
        },
      },
      where: { id: id, estado: true },
      relations: [
        'local',
        'local.activoFijoLocales',
        'itemFotos',
        'itemRepuestos',
        'itemEstados',
        'checklistsClima',
        'causaRaiz',
        'generada_por',
        'facturacion',
        'tecnico_asignado',
        'tecnico_asignado_2',
        'tipo_servicio',
        'tipo_solicitud',
        'activoFijoRepuestos',
        'activoFijoRepuestos.activoFijo',
        'activoFijoRepuestos.detallesRepuestos',
        'activoFijoRepuestos.detallesRepuestos.repuesto',
        'client',
      ],
    });

    solicitudBase.local.totalActivoFijoLocales =
      solicitudBase.local.activoFijoLocales.length || 0;

    // Obtener checklists completos para activos fijos que lo requieren
    if (solicitudBase.local.activoFijoLocales) {
      // Obtener IDs de secciones que necesitamos consultar
      const sectionIds = solicitudBase.local.activoFijoLocales
        .filter(
          (activo) =>
            activo.require_checklist === true && activo.sectionId != null,
        )
        .map((activo) => activo.sectionId);

      // Si hay secciones que consultar, obtenerlas con todos sus items y subitems
      let sectionsData = [];
      if (sectionIds.length > 0) {
        sectionsData = await this.sectionRepository.find({
          where: { id: In(sectionIds) },
          relations: ['items', 'items.subItems'],
          select: {
            id: true,
            name: true,
            items: {
              id: true,
              name: true,
              subItems: {
                id: true,
                name: true,
                foto_obligatoria: true,
                disabled: true,
              }
            }
          }
        });
      }

      // Mapear cada activo fijo con su checklist correspondiente
      solicitudBase.local.activoFijoLocales =
        solicitudBase.local.activoFijoLocales.map((activo) => {
          // Solo agregar checklist si require_checklist es true y sectionId no es null
          if (activo.require_checklist === true && activo.sectionId != null) {
            // Buscar la sección correspondiente en los datos obtenidos
            const sectionData = sectionsData.find(
              (section) => section.id === activo.sectionId,
            );

            return {
              ...activo,
              checklist: sectionData
                ? {
                    id: sectionData.id,
                    name: sectionData.name,
                    items: sectionData.items || [],
                  }
                : {
                    id: activo.sectionId,
                    name: `Checklist ${activo.sectionId}`,
                    items: [],
                  },
            };
          }
          // Si no cumple las condiciones, devolver el activo sin checklist
          return {
            ...activo,
            checklist: null,
          };
        });
    }

    // Hidratar listaInspeccion con datos actuales incluyendo foto_obligatoria
    if (solicitudBase.client.listaInspeccion && Array.isArray(solicitudBase.client.listaInspeccion)) {
      const sectionIds = solicitudBase.client.listaInspeccion.map(section => section.id).filter(Boolean);
      
      if (sectionIds.length > 0) {
        const sectionsWithCurrentData = await this.sectionRepository.find({
          where: { id: In(sectionIds) },
          relations: ['items', 'items.subItems'],
          select: {
            id: true,
            name: true,
            disabled: true,
            items: {
              id: true,
              name: true,
              disabled: true,
              subItems: {
                id: true,
                name: true,
                foto_obligatoria: true,
                disabled: true,
              }
            }
          }
        });

        // Mapear los datos actuales manteniendo la estructura original
        solicitudBase.client.listaInspeccion = solicitudBase.client.listaInspeccion.map(section => {
          const currentSectionData = sectionsWithCurrentData.find(s => s.id === section.id);
          
          if (currentSectionData) {
            return {
              ...section,
              items: section.items?.map(item => {
                const currentItemData = currentSectionData.items?.find(i => i.id === item.id);
                
                if (currentItemData) {
                  return {
                    ...item,
                    subItems: item.subItems?.map(subItem => {
                      const currentSubItemData = currentItemData.subItems?.find(si => si.id === subItem.id);
                      
                      return {
                        ...subItem,
                        foto_obligatoria: currentSubItemData?.foto_obligatoria || false
                      };
                    }) || []
                  };
                }
                
                return item;
              }) || []
            };
          }
          
          return section;
        });
      }
    }

    return solicitudBase;
  }

  //obtener solicitudes con paginacion y filtros de cliente, estado, tipo de mantenimiento, mes de facturacion decha desde y fecha hasta puede haber solo un filtro o estar todos los filtros
  //tambien quiero paginacion por la cantidad de solicitudes que vienen

  async getSolicitudesVisitaMultifiltro(
    params: any,
  ): Promise<{ data: SolicitarVisita[]; total: number }> {
    const {
      clienteId,
      status,
      tipoMantenimiento,
      mesFacturacion,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 10,
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
          'solicitud.fechaVisita',
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
        queryBuilder.andWhere(
          'solicitud.tipo_mantenimiento = :tipoMantenimiento',
          { tipoMantenimiento },
        );
      }

      if (mesFacturacion) {
        queryBuilder.andWhere('facturacion.mes = :mesFacturacion', {
          mesFacturacion,
        });
      }

      if (fechaDesde) {
        const fechaDesdeObj = new Date(fechaDesde);
        fechaDesdeObj.setHours(0, 0, 0, 0);
        queryBuilder.andWhere('solicitud.fechaIngreso >= :fechaDesde', {
          fechaDesde: fechaDesdeObj,
        });
      }

      if (fechaHasta) {
        const fechaHastaObj = new Date(fechaHasta);
        fechaHastaObj.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('solicitud.fechaIngreso <= :fechaHasta', {
          fechaHasta: fechaHastaObj,
        });
      }

      const total = await queryBuilder.getCount();

      queryBuilder.skip((page - 1) * limit).take(limit);

      const solicitudes = await queryBuilder.getMany();

      return {
        data: solicitudes,
        total,
      };
    } catch (error) {
      console.error('Error en getSolicitudesVisitaMultifiltro:', error);
      throw new Error('Error al obtener las solicitudes de visita');
    }
  }

  async deleteSolicitud(id) {
    //modificar el estado a 0 para eliminar
    await this.solicitarVisitaRepository.update(id, { estado: false });
  }

  getSolicitudesVisita(): Promise<SolicitarVisita[]> {
    return this.solicitarVisitaRepository.find({
      where: { estado: true },
      relations: [
        'local',
        'client',
        'tecnico_asignado',
        'generada_por',
        'facturacion',
        'tipo_solicitud',
      ],
      order: { fechaIngreso: 'DESC' },
    });
  }

  async getSolicitudesAprobadas(): Promise<SolicitarVisita[]> {
    const data = await this.solicitarVisitaRepository.find({
      where: {
        status: In([SolicitudStatus.APROBADA, SolicitudStatus.APROBADA]),
        estado: true,
      },
      relations: [
        'local',
        'generada_por',
        'client',
        'tecnico_asignado',
        'tecnico_asignado_2',
      ],
      order: { fechaIngreso: 'DESC' },
    });

    return data;
  }

  //filtrar por fecha que sea la misma del dia actual con la de fechaVisita pero solo dia mes y año no hora min segundos

  async solicitudesPorTecnico(rut: string): Promise<SolicitarVisita[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day

    const data = await this.solicitarVisitaRepository
      .createQueryBuilder('solicitud')
      .select([
        'solicitud.id',
        'solicitud.fechaVisita',
        'solicitud.status',
        'solicitud.estado',
        'solicitud.observaciones',
        'solicitud.tipo_mantenimiento',
        'solicitud.tipoServicioId',
        'local',
        'local.id',
        'local.nombre_local',
        'local.direccion',
        'activoFijoLocales',
        'activoFijoLocales.id',
        'activoFijoLocales.codigo_activo',
        'activoFijoLocales.tipo_equipo',
        'client',
        'tecnico_asignado',
        'tecnico_asignado_2',
        'activoFijoRepuestos',
        'activoFijo',
        'detallesRepuestos',
        'repuesto',
        'solicitud.tipo_servicio',
        'tipoServicioId.id',
        'tipoServicioId.nombre',
      ])
      .leftJoin('solicitud.local', 'local')
      .leftJoin('local.activoFijoLocales', 'activoFijoLocales')
      .leftJoin('solicitud.client', 'client')
      .leftJoin('solicitud.tecnico_asignado', 'tecnico_asignado')
      .leftJoin('solicitud.tecnico_asignado_2', 'tecnico_asignado_2')
      .leftJoin('solicitud.activoFijoRepuestos', 'activoFijoRepuestos')
      .leftJoin('activoFijoRepuestos.activoFijo', 'activoFijo')
      .leftJoin('activoFijoRepuestos.detallesRepuestos', 'detallesRepuestos')
      .leftJoin('detallesRepuestos.repuesto', 'repuesto')
      .leftJoin('solicitud.tipo_servicio', 'tipoServicioId')
      // .leftJoin('tipo_servicio', 'tipo_servicio.id = solicitud.tipoServicioId')
      .where('tecnico_asignado.rut = :rut', { rut })
      .andWhere('solicitud.estado = :estado', { estado: true })
      .andWhere('solicitud.fechaVisita BETWEEN :today AND :tomorrow', {
        today,
        tomorrow,
      })
      .andWhere('solicitud.status IN (:...statuses)', {
        statuses: [SolicitudStatus.APROBADA, SolicitudStatus.EN_SERVICIO],
      })
      .orderBy('solicitud.fechaVisita', 'DESC')
      .getMany();

    return data;
  }

  async getSolicitudesRechazadas(): Promise<SolicitarVisita[]> {
    const data = await this.solicitarVisitaRepository.find({
      where: { status: SolicitudStatus.RECHAZADA },
      relations: [
        'local',
        'client',
        'tecnico_asignado',
        'generada_por',
        'rechazada_por',
        'tecnico_asignado_2',
      ],
      order: { fechaIngreso: 'DESC' },
    });

    return data;
  }

  async getSolicitudByIdItems(id: number): Promise<SolicitarVisita> {
    return this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: [
        'itemRepuestos',
        'local',
        'client',
        'tecnico_asignado',
        'tecnico_asignado_2',
      ],
    });
  }

  async getSolicitudesAtendidasProceso(): Promise<SolicitarVisita[]> {
    const data = await this.solicitarVisitaRepository.find({
      where: {
        status: In([SolicitudStatus.ATENDIDA_EN_PROCESO]),
        estado: true,
      },
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
        'generada_por',
      ],
      order: { id: 'DESC' },
    });
    return data;
  }

  async getSolicitudesFinalizadas(): Promise<SolicitarVisita[]> {
    const data = await this.solicitarVisitaRepository.find({
      where: {
        status: SolicitudStatus.FINALIZADA,
        estado: true,
      },
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
        'generada_por',
      ],
      order: { id: 'DESC' },
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
      .leftJoinAndSelect(
        'activoFijoRepuestos.detallesRepuestos',
        'detallesRepuestos',
      )
      .leftJoinAndSelect('detallesRepuestos.repuesto', 'detallesRepuesto')
      .leftJoin('solicitud.validada_por', 'validada_por')
      .addSelect([
        'validada_por.id',
        'validada_por.name',
        'validada_por.lastName',
      ])
      .where({
        status: In([SolicitudStatus.VALIDADA, SolicitudStatus.REABIERTA]),
        estado: true,
      })
      .orderBy('solicitud.fechaIngreso', 'DESC')
      .getMany();

    return data;
  }

  async aprovarSolicitudVisita(
    id: number,
    data?: {
      tecnico_asignado_id?: number;
      tecnico_asignado_id_2?: number;
      aprobada_por_id?: number;
      fechaVisita?: Date;
      especialidad?: string;
      valorPorLocal?: number;
    },
  ): Promise<SolicitarVisita> {
    const updateData: any = {
      status: SolicitudStatus.APROBADA,
      fecha_hora_aprobacion: new Date(),
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

  async rechazarSolicitudVisita(
    id: number,
    data: { motivo: string; rechazada_por_id?: number },
  ): Promise<SolicitarVisita> {
    const updateData: any = {
      status: SolicitudStatus.RECHAZADA,
      observacion_rechazo: data.motivo,
    };

    // Si se proporciona un ID de quien rechaza, guardarlo
    if (data.rechazada_por_id) {
      updateData.rechazada_por_id = data.rechazada_por_id;
    }

    await this.solicitarVisitaRepository.update(id, updateData);

    return this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: ['local', 'client', 'tecnico_asignado', 'rechazada_por'],
    });
  }

  async finalizarSolicitudVisita(id: number): Promise<SolicitarVisita> {
    const solicitud = await this.solicitarVisitaRepository.findOne({
      where: { id },
    });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud with ID ${id} not found`);
    }

    solicitud.status = SolicitudStatus.FINALIZADA;
    solicitud.fecha_hora_fin_servicio = new Date();
    await this.solicitarVisitaRepository.save(solicitud);

    return this.solicitarVisitaRepository.findOne({
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
  }

  //quiero obtener la cantidad de solicitudes pendientes
  async getPendientes(): Promise<SolicitarVisita[]> {
    const pendientes = await this.solicitarVisitaRepository.find({
      where: {
        status: SolicitudStatus.PENDIENTE,
        estado: true,
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
        'generada_por',
      ],
      order: {
        id: 'DESC',
      },
    });
    return pendientes;
  }

  async updateSolicitudVisita(
    id: number,
    solicitud: any,
  ): Promise<SolicitarVisita> {
    const visita = await this.solicitarVisitaRepository.findOne({
      where: { id },
    });

    if (!visita) {
      throw new NotFoundException(`Visita con ID ${id} no encontrada`);
    }

    await this.solicitarVisitaRepository.update(id, {
      ...solicitud,
      fecha_hora_validacion: new Date(),
    });

    return this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: ['local', 'client', 'tecnico_asignado'],
    });
  }
  /* agregar fecha_hora_inicio_servicio  */
  async iniciarServicio(
    id: number,
    latitud: string,
    longitud: string,
  ): Promise<SolicitarVisita> {
    await this.solicitarVisitaRepository.update(id, {
      status: SolicitudStatus.EN_SERVICIO,
      fecha_hora_inicio_servicio: new Date(),
      latitud_movil: latitud,
      longitud_movil: longitud,
    });
    return this.solicitarVisitaRepository.findOne({ where: { id } });
  }

  // async finalizarServicioV2(id: number, data: any): Promise<any> {
  //   await this.solicitarVisitaRepository.update(id, {
  //     status: SolicitudStatus.FINALIZADA,
  //     fecha_hora_fin_servicio: new Date(),
  //     firma_cliente: data.firma,
  //   });

  //   const solicitud = await this.solicitarVisitaRepository.findOne({
  //     where: { id },
  //     relations: ['client'],
  //   });

  //   const itemEstadoData = [];
  //   const itemFotosData = [];
  //   const itemRepuestosData = [];
  //   const itemActivoFijoRepuestosData = [];
  //   const detalleRepuestoActivoFijoData = [];

  //   if (!data?.data?.length) {
  //     return {
  //       itemEstadoData,
  //       itemActivoFijoRepuestosData,
  //       itemFotosData,
  //       itemRepuestosData,
  //     };
  //   }

  //   const fechaActual = new Date();

  //   // Procesar datos de forma secuencial para manejar correctamente las promesas
  //   for (const item of data.data) {
  //     if (!item.checklist?.length) continue;

  //     for (const category of item.checklist) {
  //       if (!category.items?.length) continue;

  //       for (const itemList of category.items) {
  //         if (!itemList.subItems?.length) continue;

  //         for (const subItem of itemList.subItems) {
  //           const {
  //             id: itemId,
  //             estado,
  //             observaciones,
  //             fotos = [],
  //             repuestos = [],
  //             activoId = null,
  //           } = subItem;

  //           // Procesar estado
  //           if (estado === 'aprobado') {
  //             itemEstadoData.push({
  //               itemId,
  //               estado,
  //               comentario: observaciones,
  //               solicitarVisitaId: id,
  //               activo_fijo_id: activoId,
  //             });

  //             itemActivoFijoRepuestosData.push({
  //               estadoOperativo:
  //                 item.estadoOperativo === 'aprobado' ? 'funcionando' : 'detenido',
  //               observacionesEstado: observaciones,
  //               fechaRevision: fechaActual,
  //               solicitud_visita_id: id,
  //               activo_fijo_id: activoId,
  //             });
  //           } else {
  //               itemEstadoData.push({
  //                 itemId,
  //                 estado,
  //                 comentario: observaciones,
  //                 solicitarVisitaId: id,
  //                 activo_fijo_id: activoId,
  //               });

  //           }

  //           // Procesar fotos
  //           if (fotos.length > 0) {
  //             itemFotosData.push({
  //               itemId,
  //               solicitarVisitaId: id,
  //               fotos,
  //               fechaAgregado: fechaActual,
  //               activo_fijo_id: activoId,
  //             });
  //           }

  //           // Procesar repuestos
  //           if (repuestos.length > 0) {
  //             try {
  //               const repuestosPromises = repuestos.map(async (repuesto) => {
  //                 try {
  //                   const responseData = await this.getValorRepuesto(
  //                     repuesto.id,
  //                     solicitud.client.id,
  //                   );
  //                   if (responseData) {
  //                     return {
  //                       itemId,
  //                       repuestoId: repuesto.id,
  //                       cantidad: repuesto.cantidad,
  //                       comentario: '',
  //                       solicitarVisitaId: id,
  //                       precio_venta: responseData.precio_venta ?? 0,
  //                       precio_compra: responseData.precio_compra ?? 0,
  //                       estado: 'pendiente',
  //                       activo_fijo_id: activoId,
  //                     };
  //                   }
  //                   return null;
  //                 } catch (error) {
  //                   console.error(
  //                     `Error procesando repuesto ${repuesto.id}:`,
  //                     error,
  //                   );
  //                   throw error;
  //                 }
  //               });

  //               // Esperar a que todas las promesas de repuestos se resuelvan
  //               const results = await Promise.all(repuestosPromises);
  //               results.forEach((result) => {
  //                 if (result) {
  //                   itemRepuestosData.push(result);
  //                 }
  //               });
  //             } catch (error) {
  //               console.error('Error procesando repuestos:', error);
  //               throw new InternalServerErrorException(
  //                 `Error al procesar repuestos: ${error.message}`,
  //               );
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   console.log('ESTADO --------------------------------');
  //   console.log(itemEstadoData);

  //   try {
  //     const itemestadoRepositoryEntities =
  //       this.itemEstadoRepository.create(itemEstadoData);

  //     await this.itemEstadoRepository.save(itemestadoRepositoryEntities);
  //   } catch (error) {
  //     console.error('Error guardando estado:', error);
  //     throw new InternalServerErrorException(
  //       `Error al guardar estado: ${error.message}`,
  //     );
  //   }

  //   console.log('ACTIVO FIJO REPUESTOS --------------------------------');
  //   console.log(itemActivoFijoRepuestosData);
  //   // insertar registro en tabla detalle_repuesto_activo_fijo (id, cantidad, comentario, precio_unitario, activo_fijo_repuesto_id, repuesto_id, estado)

  //   try {
  //     const activoFijoRepuestosEntities =
  //       this.activoFijoRepuestosRepository.create(itemActivoFijoRepuestosData);

  //     await this.activoFijoRepuestosRepository.save(
  //       activoFijoRepuestosEntities,
  //     );
  //   } catch (error) {
  //     console.error('Error guardando activo fijo repuestos:', error);
  //     throw new InternalServerErrorException(
  //       `Error al guardar activo fijo repuestos: ${error.message}`,
  //     );
  //   }

  //   console.log('ITEM FOTOS --------------------------------');
  //   console.log(itemFotosData);

  //   try {
  //     const itemFotosEntities = this.itemFotosRepository.create(itemFotosData);
  //     await this.itemFotosRepository.save(itemFotosEntities);
  //   } catch (error) {
  //     console.error('Error guardando item fotos:', error);
  //     throw new InternalServerErrorException(
  //       `Error al guardar item fotos: ${error.message}`,
  //     );
  //   }
  //   console.log('ITEM REPUESTOS --------------------------------');
  //   console.log(itemRepuestosData);

  //   try {
  //     const itemRepuestosEntities = this.itemRepuestoRepository.create(itemRepuestosData);
  //     await this.itemRepuestoRepository.save(itemRepuestosEntities);
  //   } catch (error) {
  //     console.error('Error guardando item repuestos:', error);
  //     throw new InternalServerErrorException(
  //       `Error al guardar item repuestos: ${error.message}`,
  //     );
  //   }

  //   // TODO: REvisar el detalle de repuestos y el cambio de estado de la solicitud
  //   await this.solicitarVisitaRepository.update(id, {
  //     status: SolicitudStatus.FINALIZADA,
  //     fecha_hora_fin_servicio: new Date(),
  //     firma_cliente: data.firma,
  //   });

  //   return {
  //     itemEstadoData,
  //     itemActivoFijoRepuestosData,
  //     itemFotosData,
  //     itemRepuestosData,
  //   };

  //   // console.log('REPUESTOS --------------------------------');
  //   // console.log(itemRepuestosData);
  //   // // insertar registro en tabla item_repuestos (id, itemId, repuestoId, cantidad, comentario, solicitarVisitaId, estado, precio_venta, precio_compra, detalle_repuesto_activo_fijo_id)
  //   // const queryInsertItemRepuestos = `
  //   //       INSERT INTO item_repuestos
  //   //       (itemId, repuestoId, cantidad, comentario, solicitarVisitaId, estado, precio_venta, precio_compra, activo_fijo_id)
  //   //       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  //   //     `;

  //   // // const queryInsertDetalleRepuestos = `
  //   // //     INSERT INTO detalle_repuesto_activo_fijo
  //   // //     (cantidad, comentario, precio_unitario, activo_fijo_repuestos_id, repuesto_id, estado)
  //   // //     VALUES(?, ?, ?, ?, ?, ?);
  //   // //     `;

  //   // // const promisesDetalleRepuestos = itemRepuestosData.map((item) => {
  //   // //     return this.detalleRepuestoActivoFijoRepository.query(queryInsertDetalleRepuestos, [
  //   // //         item.cantidad,
  //   // //         item.comentario,
  //   // //         item.precio_venta,
  //   // //         item.activo_fijo_repuestos_id,
  //   // //         item.repuesto_id,
  //   // //         item.estado,
  //   // //     ]);
  //   // // });

  //   // const promisesItemRepuestos = itemRepuestosData.map((item) => {
  //   //   return this.itemRepuestoRepository.query(queryInsertItemRepuestos, [
  //   //     item.itemId,
  //   //     item.repuestoId,
  //   //     item.cantidad,
  //   //     item.comentario,
  //   //     item.solicitarVisitaId,
  //   //     item.estado,
  //   //     item.precio_venta,
  //   //     item.precio_compra,
  //   //     item.activo_fijo_id,
  //   //   ]);
  //   // });

  //   // const result = await Promise.all([
  //   //   promisesItemRepuestos,
  //   //   promisesItemFotos,
  //   //   promisesActivoData,
  //   //   promisesEstadoData,
  //   // ]);

  //   // return result;
  // }

  async finalizarServicioJSON(id: number, data: any) {
    const responseChecklist = this.responseChecklistRepository.create({
      solicitud_visita_id: id,
      is_climate: data.is_climate || false,
      climate_data: data.is_climate ? JSON.stringify(data.data) : null,
      data_normal: data.is_climate ? null : JSON.stringify(data.data),
      signature: data.firma || null,
    });
    const savedResponseChecklist =
      await this.responseChecklistRepository.save(responseChecklist);
    const updatedSolicitudVisita = await this.solicitarVisitaRepository.update(
      id,
      {
        status: SolicitudStatus.FINALIZADA,
        fecha_hora_fin_servicio: new Date(),
        firma_cliente: data.firma,
        comentario_general: data.comentario_general || '',
      },
    );

    return Promise.all([savedResponseChecklist, updatedSolicitudVisita]);

    // return {
    //   solicitar_visita_id: id,
    //   is_climate: data.is_climate,
    //   climate_data: data.is_climate ? JSON.stringify(data.data) : null,
    //   data_normal: data.is_climate ? null : JSON.stringify(data.data)
    // }
  }

  async updateChecklistVisita(id: number, data: any) {
    const responseChecklist = await this.responseChecklistRepository.findOne({
      where: { solicitud_visita_id: id },
    });

    console.log('responseChecklist', responseChecklist);

    if (!responseChecklist) {
      throw new NotFoundException('No se encontró el checklist de clima');
    }

    const responseSave = await this.responseChecklistRepository.update(
      responseChecklist.id,
      {
        is_climate: data.is_climate || false,
        climate_data: data.is_climate
          ? JSON.stringify(data.data.climate_data)
          : null,
        data_normal: data.is_climate
          ? null
          : JSON.stringify(data.data.data_normal),
      },
    );

    console.log('responseSave', responseSave);

    const updatedChecklist = await this.responseChecklistRepository.findOne({
      where: { solicitud_visita_id: id },
    });

    if (!updatedChecklist) {
      return {
        success: false,
        message: 'No se pudo actualizar el checklist',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Checklist actualizado correctamente',
      data: updatedChecklist,
    };
  }

  async getResponseChecklist(id: any) {
    const responseChecklist = await this.responseChecklistRepository.findOne({
      where: { solicitud_visita_id: id },
    });

    if (!responseChecklist) {
      throw new NotFoundException('No se encontró el checklist de clima');
    }

    return responseChecklist;
  }

  async getValorRepuesto(repuestoId: number, clientId: number) {
    try {
      const repuesto = await this.repuestoRepository.findOne({
        where: { id: repuestoId },
      });

      if (!repuesto) {
        throw new NotFoundException(
          `Repuesto con ID ${repuestoId} no encontrado`,
        );
      }

      const clienteRepuesto = await this.clienteRepuestoRepository.findOne({
        where: { repuesto: { id: repuestoId }, cliente: { id: clientId } },
      });

      return {
        precio_venta: clienteRepuesto?.precio_venta || 0,
        precio_compra: clienteRepuesto?.precio_compra || 0,
        repuesto: { ...repuesto },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener valor del repuesto: ${error.message}`,
      );
    }
  }

  /* agregar fecha_hora_fin_servicio */
  async finalizarServicio(id: number, data: any): Promise<SolicitarVisita> {
    console.log(JSON.stringify(data).toString());

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

          const savedActivo =
            await this.activoFijoRepuestosRepository.save(activoEntity);

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

      const updated =
        await this.solicitarVisitaRepository.save(solicitudToUpdate);

      return updated;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al finalizar servicio: ${error.message}`,
      );
    }
  }

  async reabrirSolicitud(id: number): Promise<SolicitarVisita> {
    const visita = await this.solicitarVisitaRepository.findOne({
      where: { id },
    });

    if (!visita) {
      throw new NotFoundException(`Visita con ID ${id} no encontrada`);
    }

    // Actualizar el estado a reabierta
    visita.status = SolicitudStatus.REABIERTA;

    return this.solicitarVisitaRepository.save(visita);
  }

  async validarSolicitud(
    id: number,
    validada_por_id: number,
    causaRaizId?: number,
    garantia?: string,
    turno?: string,
    estado_solicitud?: string,
    image_ot?: string,
  ): Promise<SolicitarVisita> {
    const visita = await this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: ['itemRepuestos', 'causaRaiz'],
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
      image_ot: image_ot || '',
    };

    // Actualizar la entidad
    await this.solicitarVisitaRepository.save({
      ...visita,
      ...updateData,
    });

    // Retornar la entidad actualizada con sus relaciones
    return this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: [
        'local',
        'client',
        'tecnico_asignado',
        'itemRepuestos',
        'itemRepuestos.repuesto',
        'causaRaiz',
      ],
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
            SolicitudStatus.ATENDIDA_EN_PROCESO,
          ]),
          estado: true,
          fechaVisita: Between(today, endOfDayPlusFourHours),
        },
        relations: [
          'local',
          'client',
          'generada_por',
          'tecnico_asignado',
          'tecnico_asignado_2',
          'tipoServicio',
        ],
        order: { id: 'DESC' },
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
    tipoSolicitud: string,
  ): Promise<SolicitarVisita[]> {
    try {
      const whereClause: any = {
        status: In([
          SolicitudStatus.VALIDADA,

          /*   SolicitudStatus.RECHAZADA,
                    SolicitudStatus.PENDIENTE */
        ]),
        estado: true,
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
            mes: ILike(`%${mesFacturacion}%`),
          },
        });

        if (facturaciones.length > 0) {
          whereClause.facturacion = {
            id_facturacion: In(facturaciones.map((f) => f.id_facturacion)),
          };
        } else {
          return [];
        }
      }

      // Add tipoSolicitud filter if provided
      if (tipoSolicitud && tipoSolicitud !== 'todos') {
        whereClause.tipoSolicitudId = parseInt(tipoSolicitud);
      }

      const data = await this.solicitarVisitaRepository.find({
        where: whereClause,
        relations: [
          'local',
          'client',
          'generada_por',
          'facturacion',
          'tecnico_asignado',
          'tecnico_asignado_2',
          'tipoServicio',
          'tipoSolicitud',
        ],
        order: { id: 'ASC' },
      });

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Método auxiliar para parsear fechas en formato DD-MM-YYYY
  private parseFecha(fecha: string): Date {
    const [dia, mes, año] = fecha.split('-').map((num) => parseInt(num));
    return new Date(año, mes - 1, dia);
  }

  // Método auxiliar para convertir nombre del mes a número (0-11)
  private getMesNumero(mes: string): number {
    const meses = {
      Enero: 0,
      Febrero: 1,
      Marzo: 2,
      Abril: 3,
      Mayo: 4,
      Junio: 5,
      Julio: 6,
      Agosto: 7,
      Septiembre: 8,
      Octubre: 9,
      Noviembre: 10,
      Diciembre: 11,
    };
    return meses[mes] || 0;
  }

  private getMesNombre(mes: number): string {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[mes];
  }

  async getSolicitudDelDiaPorCliente(
    clientId: number,
  ): Promise<SolicitarVisita[]> {
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
            SolicitudStatus.ATENDIDA_EN_PROCESO,
          ]),
          estado: true,

          fechaIngreso: Between(today, tomorrow),
        },
        relations: [
          'local',
          'client',
          'generada_por',
          'tecnico_asignado',
          'tecnico_asignado_2',
          'tipoServicio',
        ],
        order: { fechaIngreso: 'DESC' },
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
        relations: ['itemRepuestos', 'causaRaiz'],
      });

      if (!solicitud) {
        throw new NotFoundException(`Solicitud with ID ${id} not found`);
      }

      // Update the fields including causaRaizId
      const updateData = {
        ...updateSolicitudVisitaDto,
        causaRaizId: updateSolicitudVisitaDto.causaRaizId || null,
      };

      // Save the updated solicitud
      await this.solicitarVisitaRepository.save({
        ...solicitud,
        ...updateData,
      });

      // Fetch and return the updated entity with all relations
      const result = await this.solicitarVisitaRepository.findOne({
        where: { id },
        relations: [
          'itemRepuestos',
          'causaRaiz',
          'local',
          'client',
          'tecnico_asignado',
        ],
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error updating solicitud');
    }
  }

  //asignar un tecnico a una solicitud  puede ser tecnico o tecnico_2
  async asignarTecnico(
    solicitudId: number,
    tecnicoId: number,
    tipo: 'tecnico' | 'tecnico_2',
  ) {
    try {
      const solicitud = await this.solicitarVisitaRepository.findOne({
        where: { id: solicitudId },
        relations: ['tecnico_asignado', 'tecnico_asignado_2'],
      });

      if (!solicitud) {
        throw new NotFoundException(
          `Solicitud with ID ${solicitudId} not found`,
        );
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
        relations: ['tecnico_asignado', 'tecnico_asignado_2'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al asignar técnico');
    }
  }

  async changeTecnico(
    solicitudId: number,
    tecnicoId: number,
    tipo: 'tecnico' | 'tecnico_2',
  ) {
    try {
      const solicitud = await this.solicitarVisitaRepository.findOne({
        where: { id: solicitudId },
        relations: ['tecnico_asignado', 'tecnico_asignado_2'],
      });

      if (!solicitud) {
        throw new NotFoundException(
          `Solicitud with ID ${solicitudId} not found`,
        );
      }

      // Check if the technician is already assigned to the other position
      if (tipo === 'tecnico' && solicitud.tecnico_asignado_id_2 === tecnicoId) {
        throw new BadRequestException(
          'El técnico ya está asignado como técnico 2 en esta solicitud',
        );
      }
      if (tipo === 'tecnico_2' && solicitud.tecnico_asignado_id === tecnicoId) {
        throw new BadRequestException(
          'El técnico ya está asignado como técnico 1 en esta solicitud',
        );
      }

      // Create update object based on tipo
      const updateData =
        tipo === 'tecnico'
          ? { tecnico_asignado_id: tecnicoId }
          : { tecnico_asignado_id_2: tecnicoId };

      // Use repository update method
      await this.solicitarVisitaRepository.update(solicitudId, updateData);

      // Recargar la solicitud para verificar los cambios
      const updatedSolicitud = await this.solicitarVisitaRepository.findOne({
        where: { id: solicitudId },
        relations: ['tecnico_asignado', 'tecnico_asignado_2'],
      });

      return updatedSolicitud;
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException(
            'Error al cambiar técnico: ' + error.message,
          );
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
        'activoFijoRepuestos.detallesRepuestos.repuesto',
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    for (const [itemId, itemData] of Object.entries(data.repuestos) as [
      string,
      ItemRepuestoDataDto,
    ][]) {
      // Guardar fotos si existen
      if (itemData.fotos && itemData.fotos.length > 0) {
        try {
          // Filtrar las URLs nulas o vacías
          const fotosValidas = itemData.fotos.filter((foto) => {
            const url = typeof foto === 'string' ? foto : foto?.url;
            return url && typeof url === 'string' && url.trim().length > 0;
          });

          if (fotosValidas.length > 0) {
            await this.itemFotosRepository.save({
              solicitarVisita: { id },
              itemId: parseInt(itemId),
              fotos: fotosValidas.map((foto) =>
                typeof foto === 'string' ? foto : foto.url,
              ),
            });
          }
        } catch (error) {
          throw new InternalServerErrorException(
            `Error al guardar fotos: ${error.message}`,
          );
        }
      }

      // Guardar estado y comentario en la nueva tabla ItemEstado
      try {
        await this.itemEstadoRepository.save({
          solicitarVisitaId: id,
          itemId: parseInt(itemId),
          comentario: itemData.comentario || '',
          estado: itemData.estado || 'pendiente',
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Error al guardar estado del item: ${error.message}`,
        );
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
              where: { id: repuestoData.repuesto.id },
            });

            if (!repuesto) {
              throw new NotFoundException(
                `Repuesto with ID ${repuestoData.repuesto.id} not found`,
              );
            }

            // Inicializar precios con los valores base del repuesto
            let precioVenta = parseFloat(repuesto.precio_venta.toString());
            let precioCompra = parseFloat(repuesto.precio_compra.toString());

            // Buscar precios específicos del cliente si existe
            if (solicitud.client?.id) {
              const precioCliente =
                await this.clienteRepuestoRepository.findOne({
                  where: {
                    cliente_id: solicitud.client.id,
                    repuesto_id: repuesto.id,
                  },
                });

              if (precioCliente) {
                precioVenta = parseFloat(precioCliente.precio_venta.toString());
                precioCompra = parseFloat(
                  precioCliente.precio_compra.toString(),
                );
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
              precio_compra: precioCompra,
            });

            await this.itemRepuestoRepository.save(itemRepuesto);
          } catch (error) {
            throw new InternalServerErrorException(
              `Error al guardar repuesto: ${error.message}`,
            );
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
        'activoFijoRepuestos.detallesRepuestos.repuesto',
      ],
    });
  }

  async manipularChecklistClimaRepuestos(
    id: number,
    data: FinalizarServicioDto,
  ) {
    try {
      // Add firma_cliente to solicitud_visita
      if (data.firma_cliente) {
        await this.solicitarVisitaRepository.update(id, {
          firma_cliente: data.firma_cliente,
        });
      }

      // Filtrar activoFijoRepuestos que tengan repuestos
      if (data.activoFijoRepuestos?.length > 0) {
        const activoFijoRepuestosConRepuestos = data.activoFijoRepuestos.filter(
          (activo) => activo.repuestos && activo.repuestos.length > 0,
        );

        if (activoFijoRepuestosConRepuestos.length > 0) {
          await this.activoFijoRepuestosService.guardarRepuestosActivoFijo(id, {
            activoFijoRepuestos: activoFijoRepuestosConRepuestos,
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
          'activoFijoRepuestos.detallesRepuestos.repuesto',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al procesar checklist clima y repuestos: ${error.message}`,
      );
    }
  }

  async manipularItemEstados(
    id: number,
    itemEstados: Array<{ itemId: number; estado: string; comentario?: string }>,
  ) {
    const solicitud = await this.solicitarVisitaRepository.findOne({
      where: { id },
      relations: ['itemEstados'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud with ID ${id} not found`);
    }

    // Create new item states
    const itemEstadosToSave = itemEstados.map((estado) => {
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

  async asociarConMesFacturacion(
    solicitudId: number,
    facturacionId: number,
  ): Promise<SolicitarVisita> {
    const solicitud = await this.solicitarVisitaRepository.findOne({
      where: { id: solicitudId },
      relations: ['facturacion'],
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud de visita con ID ${solicitudId} no encontrada`,
      );
    }

    const facturacion = await this.facturacionRepository.findOne({
      where: { id_facturacion: facturacionId },
    });

    if (!facturacion) {
      throw new NotFoundException(
        `Mes de facturación con ID ${facturacionId} no encontrado`,
      );
    }

    // Asociar la solicitud con el mes de facturación
    solicitud.facturacion_id = facturacionId;

    return this.solicitarVisitaRepository.save(solicitud);
  }

  async getNameStatus(status: string): Promise<string> {
    const itemEstado = await this.itemEstadoRepository.findOne({
      where: { estado: status },
    });
    return itemEstado?.estado || '-';
  }

  async getNameItem(id: any): Promise<string> {
    const itemEstado = await this.itemRepository.findOne({
      where: { id: id },
    });
    return itemEstado?.name || '-';
  }

  async generatePdf(id: number): Promise<Buffer> {
    try {
      const checklist = await this.getResponseChecklist(id);
      const solicitud = await this.solicitarVisitaRepository.findOne({
        where: { id },
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
          'tipo_servicio',
          'activoFijoRepuestos',
          'activoFijoRepuestos.activoFijo',
          'activoFijoRepuestos.detallesRepuestos',
          'activoFijoRepuestos.detallesRepuestos.repuesto',
        ],
      });

      if (!solicitud)
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Reporte de visita técnica #${solicitud.id}`,
          Author: 'Sistema de gestión técnica',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      let finalBuffer: Buffer | null = null;
      doc.on('end', () => (finalBuffer = Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const marginLeft = 50;
      const marginRight = 50;
      const contentWidth = pageWidth - marginLeft - marginRight;

      // Estilos
      const styles = {
        title: { font: 'Helvetica-Bold', size: 24, fillColor: '#333333' },
        subtitle: { font: 'Helvetica-Bold', size: 14, fillColor: '#666666' },
        header: { font: 'Helvetica-Bold', size: 12, fillColor: '#333333' },
        text: { font: 'Helvetica', size: 8, fillColor: '#333333' },
        small: { font: 'Helvetica', size: 8, fillColor: '#666666' },
        tableHeader: { font: 'Helvetica-Bold', size: 8, fillColor: '#222' },
        tableCell: { font: 'Helvetica', size: 8, fillColor: '#333' },
      };

      // ============================================
      // PRIMERA PÁGINA - INFORMACIÓN PRINCIPAL
      // ============================================
      await this.generateFirstPage(
        doc,
        solicitud,
        styles,
        marginLeft,
        marginRight,
        contentWidth,
      );

      // ============================================
      // PÁGINAS DEL CHECKLIST DINÁMICO
      // ============================================
      if (checklist) {
        console.log('====== DATOS DEL CHECKLIST ======');

        // Parsear climate_data si viene como string JSON
        let climateDataForDisplay = checklist.climate_data;
        if (typeof climateDataForDisplay === 'string') {
          try {
            climateDataForDisplay = JSON.parse(climateDataForDisplay);
            console.log(
              'climate_data era un string JSON, se parseó correctamente',
            );
          } catch (error) {
            console.error(
              'Error parseando climate_data JSON para mostrar:',
              error,
            );
            climateDataForDisplay = null;
          }
        }

        console.log('Checklist data:', {
          is_climate: checklist.is_climate,
          has_climate_data: !!checklist.climate_data,
          climate_data_type: typeof checklist.climate_data,
          climate_data_length: Array.isArray(climateDataForDisplay)
            ? climateDataForDisplay.length
            : 'No es array',
          has_data_normal: !!checklist.data_normal,
          data_normal_length: checklist.data_normal?.length,
        });

        if (
          climateDataForDisplay &&
          Array.isArray(climateDataForDisplay) &&
          climateDataForDisplay.length > 0
        ) {
          console.log('Activos fijos encontrados:');
          climateDataForDisplay.forEach((cd, index) => {
            console.log(
              `  ${index + 1}. ID: ${cd.activo_fijo_id}, Código: ${cd.detailActivoFijo?.codigo_activo}, Tipo: ${cd.detailActivoFijo?.tipo_equipo}`,
            );
          });
        }

        if (checklist.is_climate && checklist.climate_data) {
          // Checklist con activos fijos (climatización)
          console.log('Iniciando generación de páginas de checklist...');
          await this.generateChecklistPages(
            doc,
            checklist,
            styles,
            marginLeft,
            marginRight,
            contentWidth,
          );
        } else if (
          !checklist.is_climate &&
          checklist.data_normal &&
          checklist.data_normal.length > 0
        ) {
          // Checklist sin activos fijos (normal)
          console.log('Iniciando generación de checklist normal...');
          await this.generateNormalChecklistPages(
            doc,
            checklist,
            styles,
            marginLeft,
            marginRight,
            contentWidth,
          );
        } else {
          console.log('No se pudo generar checklist: no hay datos válidos');
        }
      } else {
        console.log('No hay checklist disponible');
      }

      // ============================================
      // PÁGINAS DE FOTOS (Si existen) - Organizadas por activo/item/subitem
      // ============================================
      console.log('Iniciando generación de páginas de fotos...');
      try {
        await this.generatePhotoPages(
          doc,
          checklist,
          styles,
          marginLeft,
          marginRight,
          contentWidth,
        );
        console.log('Páginas de fotos generadas exitosamente');
      } catch (photoError) {
        console.error('Error en generación de fotos:', photoError);
        // Continuar sin fotos si hay error
      }

      console.log('Finalizando documento PDF...');
      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          console.log(
            'PDF finalizado exitosamente, tamaño del buffer:',
            finalBuffer?.length,
          );
          finalBuffer ? resolve(finalBuffer) : reject(new Error('PDF vacío'));
        });
        doc.on('error', (error) => {
          console.error('Error en finalización del PDF:', error);
          reject(error);
        });
      });
    } catch (err) {
      console.error('Error completo en generatePdf:', err);
      console.error('Stack trace:', err.stack);
      throw new InternalServerErrorException(
        `Error generando PDF: ${err.message}`,
      );
    }
  }

  // ============================================
  // MÉTODO PARA GENERAR PRIMERA PÁGINA
  // ============================================
  private async generateFirstPage(
    doc: any,
    solicitud: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    const pageWidth = doc.page.width;

    // Header con logo y título
    const logoPath = existsSync(
      join(__dirname, '..', '..', 'src', 'images', 'atlantis_logo.jpg'),
    )
      ? join(__dirname, '..', '..', 'src', 'images', 'atlantis_logo.jpg')
      : join(__dirname, '..', 'images', 'atlantis_logo.jpg');

    if (existsSync(logoPath)) {
      doc.image(logoPath, marginLeft, 40, { width: 60 });
    }

    doc
      .font(styles.title.font)
      .fontSize(styles.title.size)
      .fillColor(styles.title.fillColor)
      .text('REPORTE DE VISITA TÉCNICA', marginLeft + 80, 50);

    doc
      .font(styles.subtitle.font)
      .fontSize(styles.subtitle.size)
      .fillColor(styles.subtitle.fillColor)
      .text(`N° Solicitud: ${solicitud.id}`, marginLeft + 80, 80);

    // Línea separadora
    doc
      .moveTo(marginLeft, 120)
      .lineTo(pageWidth - marginRight, 120)
      .stroke('#333333');

    let currentY = 140;

    // --- TABLA INFORMACIÓN PRINCIPAL ---
    const infoTable = [
      ['Cliente', solicitud.client?.nombre || 'No especificado'],
      ['Local', solicitud.local?.nombre_local || 'No especificado'],
      ['Dirección', solicitud.local?.direccion || 'No especificada'],
      ['Teléfono', solicitud.local?.telefono || 'No especificado'],
      [
        'Fecha visita',
        solicitud.fechaVisita
          ? format(new Date(solicitud.fechaVisita), 'dd-MM-yyyy')
          : 'No especificada',
      ],
      [
        'Tipo de servicio',
        solicitud.tipo_servicio?.nombre || 'No especificado',
      ],
      [
        'Técnico asignado',
        solicitud.tecnico_asignado
          ? `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}`
          : 'No especificado',
      ],
      [
        'Hora inicio',
        solicitud.fecha_hora_inicio_servicio
          ? format(new Date(solicitud.fecha_hora_inicio_servicio), 'HH:mm')
          : 'No especificada',
      ],
      [
        'Hora término',
        solicitud.fecha_hora_fin_servicio
          ? format(new Date(solicitud.fecha_hora_fin_servicio), 'HH:mm')
          : 'No especificada',
      ],
    ];

    // Dibujar tabla elegante
    const tableX = marginLeft;
    let tableY = currentY;
    const rowHeight = 22;
    const col1Width = 150;
    const col2Width = contentWidth - col1Width;
    const borderColor = '#cccccc';

    // Encabezado de sección
    doc
      .font(styles.header.font)
      .fontSize(styles.header.size)
      .fillColor(styles.header.fillColor)
      .text('INFORMACIÓN DE LA VISITA', tableX, tableY);
    tableY += 18;

    // Borde exterior
    doc.save();
    doc
      .roundedRect(
        tableX,
        tableY,
        contentWidth,
        rowHeight * infoTable.length,
        6,
      )
      .lineWidth(0.7)
      .stroke(borderColor);
    doc.restore();

    // Filas
    for (let i = 0; i < infoTable.length; i++) {
      const y = tableY + i * rowHeight;
      // Línea horizontal
      if (i > 0) {
        doc
          .moveTo(tableX, y)
          .lineTo(tableX + contentWidth, y)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();
      }
      // Columna 1
      doc
        .font(styles.tableHeader.font)
        .fontSize(styles.tableHeader.size)
        .fillColor('#222')
        .text(infoTable[i][0], tableX + 8, y + 6, { width: col1Width - 10 });
      // Línea vertical
      doc
        .moveTo(tableX + col1Width, y)
        .lineTo(tableX + col1Width, y + rowHeight)
        .strokeColor(borderColor)
        .lineWidth(0.5)
        .stroke();
      // Columna 2
      doc
        .font(styles.tableCell.font)
        .fontSize(styles.tableCell.size)
        .fillColor('#333')
        .text(infoTable[i][1], tableX + col1Width + 8, y + 6, {
          width: col2Width - 10,
        });
    }

    tableY += rowHeight * infoTable.length + 16;
    currentY = tableY;

    // --- TABLA EQUIPOS INTERVENIDOS ---
    if (solicitud.activoFijoRepuestos?.length > 0) {
      doc
        .font(styles.header.font)
        .fontSize(styles.header.size)
        .fillColor(styles.header.fillColor)
        .text('EQUIPOS INTERVENIDOS', tableX, currentY);
      currentY += 18;
      // Encabezados
      const equiposHeaders = [
        'Código',
        'Tipo',
        'Marca',
        'Estado',
        'Observaciones',
      ];
      const colWidths = [100, 90, 90, 70, contentWidth - 340];
      // Borde exterior
      doc.save();
      doc
        .roundedRect(
          tableX,
          currentY,
          contentWidth,
          rowHeight * (solicitud.activoFijoRepuestos.length + 1),
          6,
        )
        .lineWidth(0.7)
        .stroke(borderColor);
      doc.restore();
      // Encabezados
      let x = tableX;
      // for (let i = 0; i < equiposHeaders.length; i++) {
      //   doc
      //     .font(styles.tableHeader.font)
      //     .fontSize(styles.tableHeader.size)
      //     .fillColor('#222')
      //     .text(equiposHeaders[i], x + 8, currentY + 6, {
      //       width: colWidths[i] - 10,
      //     });
      //   x += colWidths[i];
      //   if (i < equiposHeaders.length - 1) {
      //     doc
      //       .moveTo(x, currentY)
      //       .lineTo(
      //         x,
      //         currentY + rowHeight * (solicitud.activoFijoRepuestos.length + 1),
      //       )
      //       .strokeColor(borderColor)
      //       .lineWidth(0.5)
      //       .stroke();
      //   }
      // }
      // Filas de equipos
      for (let i = 0; i < solicitud.activoFijoRepuestos.length; i++) {
        const afr = solicitud.activoFijoRepuestos[i];
        let y = currentY + rowHeight * (i + 1);
        let x = tableX;
        const values = [
          afr.activoFijo?.codigo_activo || '',
          afr.activoFijo?.tipo_equipo || '',
          afr.activoFijo?.marca || '',
          afr.estadoOperativo || '',
          afr.observacionesEstado || 'Sin observaciones',
        ];
        for (let j = 0; j < values.length; j++) {
          doc
            .font(styles.tableCell.font)
            .fontSize(styles.tableCell.size)
            .fillColor('#333')
            .text(values[j], x + 8, y + 6, { width: colWidths[j] - 10 });
          x += colWidths[j];
        }
        // Línea horizontal
        if (i < solicitud.activoFijoRepuestos.length) {
          doc
            .moveTo(tableX, y)
            .lineTo(tableX + contentWidth, y)
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .stroke();
        }
      }
      currentY += rowHeight * (solicitud.activoFijoRepuestos.length + 1) + 16;
    }

    // Firma del cliente
    if (solicitud.firma_cliente) {
      doc
        .font(styles.header.font)
        .fontSize(styles.header.size)
        .fillColor(styles.header.fillColor)
        .text('FIRMA DEL CLIENTE', tableX, currentY);
      currentY += 18;
      try {
        const signatureBuffer = Buffer.from(
          solicitud.firma_cliente.replace(/^data:image\/\w+;base64,/, ''),
          'base64',
        );
        doc.image(signatureBuffer, tableX, currentY, {
          width: 100,
          height: 100,
          fit: [100, 100],
        });
        currentY += 100;
      } catch (error) {
        doc
          .font(styles.text.font)
          .fontSize(styles.text.size)
          .fillColor(styles.text.fillColor)
          .text('Firma no disponible', tableX, currentY);
        currentY += 30;
      }
    }
  }

  // ============================================
  // MÉTODO PARA GENERAR PÁGINAS DEL CHECKLIST CON ACTIVOS FIJOS
  // ============================================
  private async generateChecklistPages(
    doc: any,
    checklist: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    // Verificar y parsear climate_data si viene como string JSON
    let climateDataArray = checklist.climate_data;

    if (typeof climateDataArray === 'string') {
      try {
        console.log('climate_data es un string JSON, parseando...');
        climateDataArray = JSON.parse(climateDataArray);
        console.log(
          'climate_data parseado exitosamente, length:',
          climateDataArray?.length,
        );
      } catch (error) {
        console.error('Error parseando climate_data JSON:', error);
        return;
      }
    }

    if (!climateDataArray || !Array.isArray(climateDataArray)) {
      console.log(
        'No hay climate_data válida para generar checklist. Tipo:',
        typeof climateDataArray,
        'Es Array:',
        Array.isArray(climateDataArray),
      );
      return;
    }

    console.log(
      `Generando ${climateDataArray.length} páginas de checklist para activos fijos`,
    );

    for (let i = 0; i < climateDataArray.length; i++) {
      const climateData = climateDataArray[i];

      if (climateData && climateData.activo_fijo_id) {
        try {
          // Obtener los detalles del activo fijo si no están presentes
          if (!climateData.detailActivoFijo) {
            const activoFijo = await this.localesRepository
              .createQueryBuilder('local')
              .leftJoinAndSelect('local.activoFijoLocales', 'activoFijo')
              .where('activoFijo.id = :activoFijoId', { activoFijoId: climateData.activo_fijo_id })
              .getOne();
            
            if (activoFijo && activoFijo.activoFijoLocales.length > 0) {
              climateData.detailActivoFijo = activoFijo.activoFijoLocales[0];
              console.log(
                `Activo fijo obtenido dinámicamente: ${climateData.detailActivoFijo.codigo_activo}`
              );
            } else {
              console.log(`No se encontró activo fijo con ID: ${climateData.activo_fijo_id}`);
              continue;
            }
          }

          // Agregar nueva página para cada activo fijo
          doc.addPage();
          console.log(
            `Generando página ${i + 1} para activo fijo:`,
            climateData.detailActivoFijo.codigo_activo,
          );
          await this.generateActivoFijoChecklistPage(
            doc,
            climateData,
            styles,
            marginLeft,
            marginRight,
            contentWidth,
          );
        } catch (error) {
          console.error(`Error obteniendo activo fijo ${climateData.activo_fijo_id}:`, error);
          console.log('Saltando climateData por error:', climateData);
        }
      } else {
        console.log('Saltando climateData inválida (sin activo_fijo_id):', climateData);
      }
    }

    console.log('Terminó la generación de páginas de checklist');
  }

  // ============================================
  // MÉTODO PARA GENERAR PÁGINAS DEL CHECKLIST SIN ACTIVOS FIJOS (NORMAL)
  // ============================================
  private async generateNormalChecklistPages(
    doc: any,
    checklist: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    // Verificar y parsear data_normal si viene como string JSON
    let dataNormalArray = checklist.data_normal;

    if (typeof dataNormalArray === 'string') {
      try {
        console.log('data_normal es un string JSON, parseando...');
        dataNormalArray = JSON.parse(dataNormalArray);
        console.log(
          'data_normal parseado exitosamente, length:',
          dataNormalArray?.length,
        );
      } catch (error) {
        console.error('Error parseando data_normal JSON:', error);
        return;
      }
    }

    if (!dataNormalArray || !Array.isArray(dataNormalArray) || dataNormalArray.length === 0) {
      console.log('No hay data_normal válida para generar checklist. Tipo:', typeof dataNormalArray, 'Es Array:', Array.isArray(dataNormalArray));
      return;
    }

    // Agregar nueva página para el checklist
    doc.addPage();

    const normalData = dataNormalArray[0];
    console.log('Procesando data_normal:', {
      hasChecklist: !!normalData.checklist,
      checklistLength: normalData.checklist?.length,
      estadoOperativo: normalData.estadoOperativo,
      solicitudId: normalData.solicitud_visita_id
    });

    await this.generateNormalChecklistPage(
      doc,
      normalData,
      styles,
      marginLeft,
      marginRight,
      contentWidth,
    );
  }

  // ============================================
  // MÉTODO PARA GENERAR PÁGINA DE CHECKLIST NORMAL (SIN ACTIVO FIJO)
  // ============================================
  private async generateNormalChecklistPage(
    doc: any,
    normalData: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    let currentY = 40;
    const pageHeight = doc.page.height;
    const borderColor = '#cccccc';

    // Debug log para entender la estructura
    console.log('NormalData structure:', {
      hasChecklist: !!normalData.checklist,
      checklistLength: normalData.checklist?.length,
      checklistType: Array.isArray(normalData.checklist),
      firstItemStructure: normalData.checklist?.[0]
        ? Object.keys(normalData.checklist[0])
        : 'undefined',
      estadoOperativo: normalData.estadoOperativo,
      solicitudId: normalData.solicitud_visita_id,
    });

    // Encabezado principal similar al formato de la imagen
    // Logo GRUMAN y título
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('GRUMAN', marginLeft, currentY);

    // Título del checklist (obtener de la categoría) con validación robusta
    let tituloChecklist = 'Lista de verificación';
    if (
      normalData.checklist &&
      Array.isArray(normalData.checklist) &&
      normalData.checklist.length > 0
    ) {
      const primeraCategoria = normalData.checklist[0];
      if (primeraCategoria && primeraCategoria.categoria) {
        tituloChecklist = primeraCategoria.categoria;
      }
    }
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text(tituloChecklist, marginLeft + 200, currentY, {
        width: contentWidth - 200,
        align: 'center',
      });

    currentY += 25;

    // Omitimos las tablas de información del activo fijo ya que no hay activo fijo en este flujo
    
    // Tabla principal del checklist (formato exacto usando la misma función)
    console.log('Dibujando tabla principal del checklist normal...');
    try {
      await this.drawMainChecklistTable(
        doc,
        normalData,
        marginLeft,
        currentY,
        contentWidth,
        styles,
        pageHeight,
      );
      console.log('Tabla principal dibujada exitosamente');
    } catch (tableError) {
      console.error('Error dibujando tabla principal:', tableError);
      throw tableError;
    }
  }

  // ============================================
  // MÉTODO PARA GENERAR PÁGINA POR ACTIVO FIJO - FORMATO ESPECÍFICO
  // ============================================
  private async generateActivoFijoChecklistPage(
    doc: any,
    climateData: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    let currentY = 40;
    const pageHeight = doc.page.height;
    const activoFijo = climateData.detailActivoFijo;
    const borderColor = '#cccccc';

    // Debug log para entender la estructura
    console.log('ClimateData structure:', {
      hasChecklist: !!climateData.checklist,
      checklistLength: climateData.checklist?.length,
      checklistType: Array.isArray(climateData.checklist),
      firstItemStructure: climateData.checklist?.[0]
        ? Object.keys(climateData.checklist[0])
        : 'undefined',
      activoFijoInfo: {
        id: activoFijo?.id,
        codigo: activoFijo?.codigo_activo,
        tipo: activoFijo?.tipo_equipo,
      },
    });

    // Encabezado principal similar al formato de la imagen
    // Logo GRUMAN y título
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('GRUMAN', marginLeft, currentY);

    // Título del checklist (obtener de la categoría) con validación robusta
    let tituloChecklist = 'Lista de verificación de activos';
    if (
      climateData.checklist &&
      Array.isArray(climateData.checklist) &&
      climateData.checklist.length > 0
    ) {
      const primeraCategoria = climateData.checklist[0];
      if (primeraCategoria && primeraCategoria.categoria) {
        tituloChecklist = primeraCategoria.categoria;
      }
    }
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text(tituloChecklist, marginLeft + 200, currentY, {
        width: contentWidth - 200,
        align: 'center',
      });

    currentY += 25;

    // // Tabla superior con información básica (similar al formato)
    await this.drawMainInfoTable(
      doc,
      activoFijo,
      marginLeft,
      currentY,
      contentWidth,
      styles,
    );
    currentY += 35;

    // // Información del equipo
    await this.drawEquipmentDetailsTable(
      doc,
      activoFijo,
      marginLeft,
      currentY,
      contentWidth,
      styles,
    );
    currentY += 35;

    // Tabla principal del checklist (formato exacto de la imagen)
    console.log('Dibujando tabla principal del checklist...');
    try {
      await this.drawMainChecklistTable(
        doc,
        climateData,
        marginLeft,
        currentY,
        contentWidth,
        styles,
        pageHeight,
      );
      console.log('Tabla principal dibujada exitosamente');
    } catch (tableError) {
      console.error('Error dibujando tabla principal:', tableError);
      throw tableError;
    }
  }

  // ============================================
  // MÉTODO PARA DIBUJAR TABLA DE INFORMACIÓN PRINCIPAL
  // ============================================
  private async drawMainInfoTable(
    doc: any,
    activoFijo: any,
    marginLeft: number,
    currentY: number,
    contentWidth: number,
    styles: any,
  ) {
    console.log('activoFijo', activoFijo);
    console.log('Dibujando tabla de información principal...');
    
    const tableData = [
      ['CODIGO', activoFijo.codigo_activo, 'MARCA', activoFijo.marca],
      ['TIPO', activoFijo.tipo_equipo, 'REFRIGERANTE', activoFijo.refrigerante],
      ['ONOFF', activoFijo.on_off_inverter, 'POTENCIA', activoFijo.potencia_equipo],
      ['UBICACIÓN', activoFijo.suministra],
      // ['TELÉFONO', activoFijo.telefono, 'HORA INICIO', activoFijo.hora_inicio],
      // ['HORA TÉRMINO', activoFijo.hora_termino, 'HORA TÉRMINO', activoFijo.hora_termino],
    ];

    const rowHeight = 15;
    const colWidths = [120, 120, 120, 140];
    const borderColor = '#cccccc';
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    let yPos = currentY;
    const pageStartY = yPos;

    // Dibujar cada fila con su contenido
    for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
      const row = tableData[rowIndex];
      let xPos = marginLeft;

      // Dibujar fondo gris para columnas de etiquetas (columnas 0 y 2)
      for (let i = 0; i < row.length; i++) {
        if (i === 0 || i === 2) { // Columnas de etiquetas
          doc.save();
          doc
            .rect(xPos, yPos, colWidths[i], rowHeight)
            .fillColor('#f0f0f0')
            .fill();
          doc.restore();
        }
        xPos += colWidths[i];
      }

      // Dibujar contenido de cada celda
      xPos = marginLeft;
      for (let i = 0; i < row.length; i++) {
        if (row[i]) { // Solo dibujar si hay contenido
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor('#000000')
            .text(row[i], xPos + 3, yPos + 7, {
              width: colWidths[i] - 6,
            });
        }
        xPos += colWidths[i];
      }

      // Dibujar línea horizontal después de cada fila
      doc
        .moveTo(marginLeft, yPos + rowHeight)
        .lineTo(marginLeft + tableWidth, yPos + rowHeight)
        .strokeColor(borderColor)
        .lineWidth(0.5)
        .stroke();

      // Dibujar líneas verticales para esta fila
      xPos = marginLeft;
      for (let i = 0; i < colWidths.length; i++) {
        // Línea vertical (incluir la primera y la última)
        doc
          .moveTo(xPos, yPos)
          .lineTo(xPos, yPos + rowHeight)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();
        
        xPos += colWidths[i];
      }
      // Línea vertical final (borde derecho)
      doc
        .moveTo(xPos, yPos)
        .lineTo(xPos, yPos + rowHeight)
        .strokeColor(borderColor)
        .lineWidth(0.5)
        .stroke();

      yPos += rowHeight;
    }

    // Dibujar bordes exteriores completos
    // Borde superior
    doc
      .moveTo(marginLeft, pageStartY)
      .lineTo(marginLeft + tableWidth, pageStartY)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();

    // Borde izquierdo
    doc
      .moveTo(marginLeft, pageStartY)
      .lineTo(marginLeft, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();
    
    // Borde derecho
    doc
      .moveTo(marginLeft + tableWidth, pageStartY)
      .lineTo(marginLeft + tableWidth, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();
    
    // Borde inferior (ya dibujado en el último ciclo, pero reforzamos)
    doc
      .moveTo(marginLeft, yPos)
      .lineTo(marginLeft + tableWidth, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();

    console.log('Tabla de información principal dibujada exitosamente');
  }

  // ============================================
  // MÉTODO PARA DIBUJAR INFORMACIÓN DETALLADA DEL EQUIPO
  // ============================================
  private async drawEquipmentDetailsTable(
    doc: any,
    activoFijo: any,
    marginLeft: number,
    currentY: number,
    contentWidth: number,
    styles: any,
  ) {
    console.log('Dibujando tabla de detalles del equipo...');
    // ... existing code ...
    // const equipmentData = [
    //   ['MARCA', activoFijo?.marca || ''],
    //   ['MODELO', ''],
    //   ['TIPO EQUIPO', activoFijo?.tipo_equipo || ''],
    //   ['POTENCIA', activoFijo?.potencia_equipo || ''],
    //   ['REFRIGERANTE', activoFijo?.refrigerante || ''],
    //   ['UBICACIÓN', activoFijo?.suministra || ''],
    // ];

    // const rowHeight = 15;
    // const col1Width = 100;
    // const col2Width = contentWidth - col1Width;

    // let yPos = currentY;
    // for (const row of equipmentData) {
    //   // Columna 1
    //   doc
    //     .rect(marginLeft, yPos, col1Width, rowHeight)
    //     .fillColor('#e0e0e0')
    //     .fill()
    //     .strokeColor('#000000')
    //     .lineWidth(0.5)
    //     .stroke();

    //   doc
    //     .font('Helvetica-Bold')
    //     .fontSize(7)
    //     .fillColor('#000000')
    //     .text(row[0], marginLeft + 3, yPos + 5, {
    //       width: col1Width - 6,
    //     });

    //   // Columna 2
    //   doc
    //     .rect(marginLeft + col1Width, yPos, col2Width, rowHeight)
    //     .fillColor('#ffffff')
    //     .fill()
    //     .strokeColor('#000000')
    //     .lineWidth(0.5)
    //     .stroke();

    //   doc
    //     .font('Helvetica')
    //     .fontSize(7)
    //     .fillColor('#000000')
    //     .text(row[1], marginLeft + col1Width + 3, yPos + 5, {
    //       width: col2Width - 6,
    //     });

    //   yPos += rowHeight;
    // }
    console.log('Tabla de detalles del equipo dibujada exitosamente');
  }

  // ============================================
  // MÉTODO PARA DIBUJAR TABLA PRINCIPAL DEL CHECKLIST (FORMATO EXACTO)
  // ============================================
  private async drawMainChecklistTable(
    doc: any,
    climateData: any,
    marginLeft: number,
    currentY: number,
    contentWidth: number,
    styles: any,
    pageHeight: number,
  ) {
    console.log('Iniciando drawMainChecklistTable...');
    let yPos = currentY;
    const rowHeight = 20;

    // Encabezados con anchos ajustados para texto largo en observaciones
    const headers = [
      { text: 'ITEM', width: 40 },
      { text: 'ACTIVIDAD', width: 200 }, // Reducido de 300 a 200
      { text: 'ESTADO', width: 80 },     // Aumentado de 60 a 80
      { text: 'OBSERVACIÓN / RECOMENDACIÓN', width: contentWidth - 320 }, // Más espacio para texto largo
    ];

    // Borde exterior de la tabla headers (como en la primera página)
    const tableWidth = headers.reduce((sum, h) => sum + h.width, 0);
    const borderColor = '#cccccc';
    
    // Variables para control de páginas y bordes
    let pageStartY = yPos;
    let isFirstPage = true;
    
    doc.save();
    doc
      .rect(marginLeft, yPos, tableWidth, rowHeight)
      .fillColor('#cccccc')
      .fill()
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();
    doc.restore();

    // Dibujar encabezados y líneas verticales
    let xPos = marginLeft;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      
      // Línea vertical entre columnas (excepto la primera)
      if (i > 0) {
        doc
          .moveTo(xPos, yPos)
          .lineTo(xPos, yPos + rowHeight)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor('#000000')
        .text(header.text, xPos + 3, yPos + 7, {
          width: header.width - 6,
          align: 'center',
        });

      xPos += header.width;
    }

    yPos += rowHeight;
    let itemCounter = 1;

    // Procesar checklist dinámicamente
    if (
      climateData.checklist &&
      Array.isArray(climateData.checklist) &&
      climateData.checklist.length > 0
    ) {
      for (const categoria of climateData.checklist) {
        for (const item of categoria.items) {
          for (const subItem of item.subItems) {
            // Verificar si necesitamos nueva página
            if (yPos + rowHeight > pageHeight - 100) {
              // Dibujar bordes laterales de la página actual antes de cambiar
              const currentPageHeight = yPos - pageStartY;
              
              // Borde izquierdo
              doc
                .moveTo(marginLeft, pageStartY)
                .lineTo(marginLeft, yPos)
                .strokeColor(borderColor)
                .lineWidth(0.7)
                .stroke();
              
              // Borde derecho
              doc
                .moveTo(marginLeft + tableWidth, pageStartY)
                .lineTo(marginLeft + tableWidth, yPos)
                .strokeColor(borderColor)
                .lineWidth(0.7)
                .stroke();
              
              // Borde inferior de la página actual
              doc
                .moveTo(marginLeft, yPos)
                .lineTo(marginLeft + tableWidth, yPos)
                .strokeColor(borderColor)
                .lineWidth(0.7)
                .stroke();

              doc.addPage();
              yPos = 50;
              pageStartY = yPos; // Actualizar inicio de nueva página
              isFirstPage = false;

              // Repetir encabezados en nueva página (patrón primera página)
              doc.save();
              doc
                .rect(marginLeft, yPos, tableWidth, rowHeight)
                .fillColor('#cccccc')
                .fill()
                .strokeColor(borderColor)
                .lineWidth(0.7)
                .stroke();
              doc.restore();

              // Dibujar encabezados y líneas verticales
              let headerXPos = marginLeft;
              for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                
                // Línea vertical entre columnas (excepto la primera)
                if (i > 0) {
                  doc
                    .moveTo(headerXPos, yPos)
                    .lineTo(headerXPos, yPos + rowHeight)
                    .strokeColor(borderColor)
                    .lineWidth(0.5)
                    .stroke();
                }

                doc
                  .font('Helvetica-Bold')
                  .fontSize(7)
                  .fillColor('#000000')
                  .text(header.text, headerXPos + 3, yPos + 7, {
                    width: header.width - 6,
                    align: 'center',
                  });

                headerXPos += header.width;
              }
              yPos += rowHeight;
            }

            // Dibujar línea horizontal (como en la primera página)
            doc
              .moveTo(marginLeft, yPos + rowHeight)
              .lineTo(marginLeft + tableWidth, yPos + rowHeight)
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();

            // Contenido de la fila (sin rectángulos individuales)
            xPos = marginLeft;

            // ITEM (número)
            doc
              .font('Helvetica')
              .fontSize(7)
              .fillColor('#000000')
              .text(itemCounter.toString(), xPos + 3, yPos + 7, {
                width: headers[0].width - 6,
                align: 'center',
              });
            xPos += headers[0].width;

            // Línea vertical 1
            doc
              .moveTo(xPos, yPos)
              .lineTo(xPos, yPos + rowHeight)
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();

            // ACTIVIDAD
            doc
              .font('Helvetica')
              .fontSize(7)
              .fillColor('#000000')
              .text(subItem.nombre || '', xPos + 3, yPos + 7, {
                width: headers[1].width - 6,
              });
            xPos += headers[1].width;

            // Línea vertical 2
            doc
              .moveTo(xPos, yPos)
              .lineTo(xPos, yPos + rowHeight)
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();

            // ESTADO
            const estadoTexto = this.getEstadoTextForTable(subItem.estado);
            console.log(
              `Estado original: ${subItem.estado} -> Texto mapeado: ${estadoTexto}`,
            );
            doc
              .font('Helvetica-Bold')
              .fontSize(7)
              .fillColor('#000000')
              .text(estadoTexto, xPos + 3, yPos + 7, {
                width: headers[2].width - 6,
                align: 'center',
              });
            xPos += headers[2].width;

            // Línea vertical 3
            doc
              .moveTo(xPos, yPos)
              .lineTo(xPos, yPos + rowHeight)
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();

            // OBSERVACIÓN (con ajuste automático de altura)
            const observationText = subItem.observaciones || '';
            
            // Calcular altura necesaria para el texto largo
            const textHeight = doc.heightOfString(observationText, {
              width: headers[3].width - 6,
              fontSize: 7
            });
            
            // Usar mayor altura entre rowHeight estándar y texto calculado
            const cellHeight = Math.max(rowHeight, textHeight + 14); // +14 para padding
            
            doc
              .font('Helvetica')
              .fontSize(7)
              .fillColor('#000000')
              .text(observationText, xPos + 3, yPos + 7, {
                width: headers[3].width - 6,
                height: cellHeight - 14, // Espacio para padding
                ellipsis: false // No cortar el texto
              });

            // Si la celda es más alta, dibujar líneas horizontales adicionales para mantener la estructura
            if (cellHeight > rowHeight) {
              // Extender las líneas verticales para esta fila más alta
              for (let i = 0; i < 3; i++) { // Para las 3 líneas verticales
                let lineX = marginLeft;
                for (let j = 0; j <= i; j++) {
                  lineX += headers[j].width;
                }
                doc
                  .moveTo(lineX, yPos + rowHeight)
                  .lineTo(lineX, yPos + cellHeight)
                  .strokeColor(borderColor)
                  .lineWidth(0.5)
                  .stroke();
              }
              
              yPos += cellHeight;
            } else {
              yPos += rowHeight;
            }
            itemCounter++;
          }
        }
      }
    }

    // Dibujar bordes exteriores de la página actual (última página)
    const currentPageHeight = yPos - pageStartY;
    
    // Borde izquierdo de la página actual
    doc
      .moveTo(marginLeft, pageStartY)
      .lineTo(marginLeft, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();
    
    // Borde derecho de la página actual
    doc
      .moveTo(marginLeft + tableWidth, pageStartY)
      .lineTo(marginLeft + tableWidth, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();
    
    // Borde inferior final de la tabla
    doc
      .moveTo(marginLeft, yPos)
      .lineTo(marginLeft + tableWidth, yPos)
      .strokeColor(borderColor)
      .lineWidth(0.7)
      .stroke();

    // Si es la primera página (tabla completa en una página), también dibujar borde superior
    if (isFirstPage) {
      doc
        .moveTo(marginLeft, pageStartY)
        .lineTo(marginLeft + tableWidth, pageStartY)
        .strokeColor(borderColor)
        .lineWidth(0.7)
        .stroke();
    }

    // Solo agregar sección de observaciones si hay observaciones reales
    const hasObservations = this.hasRealObservations(climateData);
    if (hasObservations) {
      yPos += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#000000')
        .text('OBSERVACIONES GENERALES', marginLeft, yPos);
    }

    console.log('drawMainChecklistTable completado exitosamente');
  }

  // ============================================
  // MÉTODO PARA VERIFICAR SI HAY OBSERVACIONES REALES EN EL CHECKLIST
  // ============================================
  private hasRealObservations(climateData: any): boolean {
    if (!climateData.checklist || !Array.isArray(climateData.checklist)) {
      return false;
    }

    for (const categoria of climateData.checklist) {
      if (!categoria.items || !Array.isArray(categoria.items)) continue;

      for (const item of categoria.items) {
        if (!item.subItems || !Array.isArray(item.subItems)) continue;

        for (const subItem of item.subItems) {
          if (subItem.observaciones && subItem.observaciones.trim() !== '') {
            return true;
          }
        }
      }
    }

    return false;
  }

  // ============================================
  // MÉTODO AUXILIAR PARA ESTADO EN TABLA
  // ============================================
  private getEstadoTextForTable(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'Aprobado.';
      case 'rechazado':
        return 'Rechazado';
      case 'no_aplica':
        return 'N/A';
      case 'no_conforme':
        return 'No conforme';
      default:
        return 'N/A';
    }
  }

  // ============================================
  // MÉTODO PARA DIBUJAR ENCABEZADOS DE TABLA
  // ============================================
  private drawTableHeaders(
    doc: any,
    headers: string[],
    colWidths: number[],
    marginLeft: number,
    currentY: number,
    styles: any,
  ) {
    let x = marginLeft;

    for (let i = 0; i < headers.length; i++) {
      // Fondo del encabezado
      doc.save();
      doc.rect(x, currentY, colWidths[i], 25).fillColor('#34495e').fill();
      doc.restore();

      // Texto del encabezado
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#ffffff')
        .text(headers[i], x + 5, currentY + 8, {
          width: colWidths[i] - 10,
          align: 'center',
        });

      // Borde
      doc.rect(x, currentY, colWidths[i], 25).stroke('#cccccc');

      x += colWidths[i];
    }
  }

  // ============================================
  // MÉTODO PARA DIBUJAR FILA DEL CHECKLIST
  // ============================================
  private async drawChecklistRow(
    doc: any,
    subItem: any,
    itemNumber: number,
    marginLeft: number,
    currentY: number,
    colWidths: number[],
    styles: any,
  ) {
    let x = marginLeft;
    const rowHeight = 25;

    // Número de item
    doc
      .rect(x, currentY, colWidths[0], rowHeight)
      .fillColor('#ecf0f1')
      .fill()
      .stroke('#cccccc');

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#333333')
      .text(itemNumber.toString(), x + 5, currentY + 8, {
        width: colWidths[0] - 10,
        align: 'center',
      });
    x += colWidths[0];

    // Actividad
    doc
      .rect(x, currentY, colWidths[1], rowHeight)
      .fillColor('#ffffff')
      .fill()
      .stroke('#cccccc');

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#333333')
      .text(subItem.nombre || '', x + 5, currentY + 4, {
        width: colWidths[1] - 10,
        lineGap: 1,
      });
    x += colWidths[1];

    // Estado
    const estadoColor = this.getEstadoColor(subItem.estado);
    doc
      .rect(x, currentY, colWidths[2], rowHeight)
      .fillColor('#ffffff')
      .fill()
      .stroke('#cccccc');

    // Pequeño círculo de estado
    const circleX = x + colWidths[2] / 2;
    const circleY = currentY + rowHeight / 2;
    doc.circle(circleX, circleY, 6).fillColor(estadoColor).fill();

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#333333')
      .text(this.getEstadoText(subItem.estado), x + 5, currentY + 17, {
        width: colWidths[2] - 10,
        align: 'center',
      });
    x += colWidths[2];

    // Observaciones
    doc
      .rect(x, currentY, colWidths[3], rowHeight)
      .fillColor('#ffffff')
      .fill()
      .stroke('#cccccc');

    doc
      .font('Helvetica')
      .fontSize(7)
      .strokeColor('#000000')
      .lineWidth(0.5)
      .stroke()
      .text(subItem.observaciones || 'Sin observaciones', x + 5, currentY + 4, {
        width: colWidths[3] - 10,
        lineGap: 1,
      });
  }

  // ============================================
  // MÉTODO PARA DIBUJAR TABLA DE RENDIMIENTO
  // ============================================
  private async drawPerformanceTable(
    doc: any,
    climateData: any,
    marginLeft: number,
    currentY: number,
    contentWidth: number,
    styles: any,
  ) {
    // Título
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#333333')
      .text('TABLA DE MEDICIÓN DE RENDIMIENTO', marginLeft, currentY);

    currentY += 25;

    // Encontrar mediciones en el checklist
    const mediciones = [];
    if (climateData.checklist && Array.isArray(climateData.checklist)) {
      for (const categoria of climateData.checklist) {
        for (const item of categoria.items) {
          if (item.nombre === 'Inspección de rendimiento') {
            for (const subItem of item.subItems) {
              if (
                subItem.observaciones &&
                subItem.observaciones !== 'Sin observaciones'
              ) {
                mediciones.push({
                  medicion: subItem.nombre,
                  valor: subItem.observaciones,
                  unidad: this.getUnidadMedicion(subItem.nombre),
                });
              }
            }
          }
        }
      }
    }

    if (mediciones.length > 0) {
      // Encabezados
      const headers = ['ITEM', 'MEDICIÓN', '[°C]', 'OBSERVACIÓN'];
      const colWidths = [40, 150, 60, contentWidth - 250];

      let x = marginLeft;
      for (let i = 0; i < headers.length; i++) {
        doc.save();
        doc.rect(x, currentY, colWidths[i], 20).fillColor('#95a5a6').fill();
        doc.restore();

        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#ffffff')
          .text(headers[i], x + 5, currentY + 6, {
            width: colWidths[i] - 10,
            align: 'center',
          });

        doc.rect(x, currentY, colWidths[i], 20).stroke('#cccccc');

        x += colWidths[i];
      }

      currentY += 20;

      // Filas de mediciones
      for (let i = 0; i < mediciones.length; i++) {
        const medicion = mediciones[i];
        let x = marginLeft;

        // Item
        doc
          .rect(x, currentY, colWidths[0], 20)
          .fillColor('#ecf0f1')
          .fill()
          .stroke('#cccccc');
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#333333')
          .text((i + 1).toString(), x + 5, currentY + 6, {
            width: colWidths[0] - 10,
            align: 'center',
          });
        x += colWidths[0];

        // Medición
        doc
          .rect(x, currentY, colWidths[1], 20)
          .fillColor('#ffffff')
          .fill()
          .stroke('#cccccc');
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#333333')
          .text(medicion.medicion, x + 5, currentY + 6, {
            width: colWidths[1] - 10,
          });
        x += colWidths[1];

        // Valor
        doc
          .rect(x, currentY, colWidths[2], 20)
          .fillColor('#ffffff')
          .fill()
          .stroke('#cccccc');
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#2980b9')
          .text(medicion.valor, x + 5, currentY + 6, {
            width: colWidths[2] - 10,
            align: 'center',
          });
        x += colWidths[2];

        // Observación
        doc
          .rect(x, currentY, colWidths[3], 20)
          .fillColor('#ffffff')
          .fill()
          .stroke('#cccccc');
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#333333')
          .text('', x + 5, currentY + 6, {
            width: colWidths[3] - 10,
          });

        currentY += 20;
      }
    }
  }

  // ============================================
  // MÉTODO PARA GENERAR PÁGINAS DE FOTOS - ORGANIZADAS POR ACTIVO/ITEM/SUBITEM
  // ============================================
  private async generatePhotoPages(
    doc: any,
    checklist: any,
    styles: any,
    marginLeft: number,
    marginRight: number,
    contentWidth: number,
  ) {
    if (!checklist) return;

    let hasPhotos = false;
    let photosData = [];

    // Verificar y organizar fotos según el tipo de checklist
    if (checklist.is_climate && checklist.climate_data) {
      // Parsear climate_data si viene como string JSON
      let climateDataArray = checklist.climate_data;
      if (typeof climateDataArray === 'string') {
        try {
          climateDataArray = JSON.parse(climateDataArray);
        } catch (error) {
          console.error(
            'Error parseando climate_data JSON en generatePhotoPages:',
            error,
          );
          climateDataArray = [];
        }
      }

      // Checklist con activos fijos (climatización)
      if (Array.isArray(climateDataArray)) {
        for (const climateData of climateDataArray) {
          // Obtener los detalles del activo fijo si no están presentes
          if (climateData.activo_fijo_id && !climateData.detailActivoFijo) {
            try {
              const activoFijo = await this.localesRepository
                .createQueryBuilder('local')
                .leftJoinAndSelect('local.activoFijoLocales', 'activoFijo')
                .where('activoFijo.id = :activoFijoId', { activoFijoId: climateData.activo_fijo_id })
                .getOne();
              
              if (activoFijo && activoFijo.activoFijoLocales.length > 0) {
                climateData.detailActivoFijo = activoFijo.activoFijoLocales[0];
              }
            } catch (error) {
              console.error(`Error obteniendo activo fijo para fotos ${climateData.activo_fijo_id}:`, error);
            }
          }

          if (climateData.checklist && Array.isArray(climateData.checklist)) {
            for (const categoria of climateData.checklist) {
              for (const item of categoria.items) {
                for (const subItem of item.subItems) {
                  if (subItem.fotos && subItem.fotos.length > 0) {
                    hasPhotos = true;
                    photosData.push({
                      activoFijo: climateData.detailActivoFijo,
                      categoria: categoria.categoria,
                      item: item.nombre,
                      subItem: subItem.nombre,
                      fotos: subItem.fotos,
                    });
                  }
                }
              }
            }
          }
        }
      }
    } else if (!checklist.is_climate && checklist.data_normal) {
      // Checklist sin activos fijos (normal)
      // Parsear data_normal si viene como string JSON
      let dataNormalArray = checklist.data_normal;
      if (typeof dataNormalArray === 'string') {
        try {
          dataNormalArray = JSON.parse(dataNormalArray);
        } catch (error) {
          console.error(
            'Error parseando data_normal JSON en generatePhotoPages:',
            error,
          );
          dataNormalArray = [];
        }
      }

      if (Array.isArray(dataNormalArray) && dataNormalArray.length > 0) {
        const normalData = dataNormalArray[0];
        if (normalData && normalData.checklist) {
          for (const categoria of normalData.checklist) {
            for (const item of categoria.items) {
              for (const subItem of item.subItems) {
                if (subItem.fotos && subItem.fotos.length > 0) {
                  hasPhotos = true;
                  photosData.push({
                    activoFijo: null,
                    categoria: categoria.categoria,
                    item: item.nombre,
                    subItem: subItem.nombre,
                    fotos: subItem.fotos,
                  });
                }
              }
            }
          }
        }
      }
    }

    if (!hasPhotos) return;

    // Agregar página de fotos
    doc.addPage();

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#333')
      .text('REGISTRO FOTOGRÁFICO', marginLeft, 40, {
        align: 'center',
        underline: true,
      });

    let y = 80;
    const imageSize = 150;
    const gap = 15;
    const imagesPerRow = 3;
    const pageWidth = doc.page.width;
    const xPositions = Array.from(
      { length: imagesPerRow },
      (_, i) => marginLeft + i * (imageSize + gap),
    );

    // Agrupar fotos por activo fijo
    const groupedByActivo = {};

    for (const photoData of photosData) {
      const activoKey = photoData.activoFijo
        ? photoData.activoFijo.codigo_activo
        : 'GENERAL';
      if (!groupedByActivo[activoKey]) {
        groupedByActivo[activoKey] = {
          activoFijo: photoData.activoFijo,
          items: {},
        };
      }

      const itemKey = photoData.item;
      if (!groupedByActivo[activoKey].items[itemKey]) {
        groupedByActivo[activoKey].items[itemKey] = [];
      }

      groupedByActivo[activoKey].items[itemKey].push({
        subItem: photoData.subItem,
        fotos: photoData.fotos,
      });
    }

    // Generar fotos organizadas por activo fijo -> item -> subitem
    for (const [activoKey, activoData] of Object.entries(groupedByActivo)) {
      // Título del activo fijo
      if (y + 80 > doc.page.height - 60) {
        doc.addPage();
        y = 80;
      }

      doc.save();
      doc
        .roundedRect(marginLeft - 5, y - 5, contentWidth + 10, 30, 5)
        .fillColor('#2c3e50')
        .fill();
      doc.restore();

      const activoTitle = (activoData as any).activoFijo
        ? `${(activoData as any).activoFijo.codigo_activo} - ${(activoData as any).activoFijo.tipo_equipo} ${(activoData as any).activoFijo.marca}`
        : 'INSPECCIÓN GENERAL';

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(activoTitle, marginLeft, y + 5, {
          width: contentWidth,
          align: 'center',
        });

      y += 40;

      // Generar fotos por item
      for (const [itemName, subItems] of Object.entries(
        (activoData as any).items,
      )) {
        // Título del item
        if (y + 50 > doc.page.height - 60) {
          doc.addPage();
          y = 80;
        }

        doc.save();
        doc
          .roundedRect(marginLeft - 3, y - 3, contentWidth + 6, 25, 3)
          .fillColor('#34495e')
          .fill();
        doc.restore();

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text(itemName, marginLeft, y + 5, {
            width: contentWidth,
            align: 'left',
          });

        y += 30;

        // Generar fotos por subitem
        for (const subItemData of subItems as any[]) {
          if (!subItemData.fotos?.length) continue;

          // Título del subitem
          if (y + imageSize + 50 > doc.page.height - 60) {
            doc.addPage();
            y = 80;
          }

          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .strokeColor('#2c3e50')
            .lineWidth(0.5)
            .stroke()
            .fillColor('#2c3e50')
            .text(`• ${subItemData.subItem}`, marginLeft, y);

          y += 20;

          let currentCol = 0;

          for (const fotoUrl of subItemData.fotos) {
            try {
              const imageResult = await this.downloadImage(fotoUrl);

              if (!imageResult.success) {
                throw new Error(imageResult.error);
              }

              if (currentCol >= imagesPerRow) {
                currentCol = 0;
                y += imageSize + gap;
              }

              if (y + imageSize > doc.page.height - 60) {
                doc.addPage();
                y = 80;
                currentCol = 0;
              }

              // Marco para la imagen con sombra
              doc
                .save()
                .rect(
                  xPositions[currentCol] - 2,
                  y - 2,
                  imageSize + 4,
                  imageSize + 4,
                )
                .fillColor('#bdc3c7')
                .fill();

              doc
                .rect(xPositions[currentCol], y, imageSize, imageSize)
                .fillColor('#fff')
                .fill()
                .lineWidth(1)
                .strokeColor('#95a5a6')
                .stroke();
              doc.restore();

              // Imagen
              doc.image(imageResult.data, xPositions[currentCol], y, {
                fit: [imageSize, imageSize],
                align: 'center',
                valign: 'center',
              });

              currentCol++;
            } catch (err) {
              if (currentCol >= imagesPerRow) {
                currentCol = 0;
                y += imageSize + gap;
              }

              doc
                .font('Helvetica')
                .fontSize(8)
                .fillColor('#e74c3c')
                .text(
                  `Error cargando imagen`,
                  xPositions[currentCol],
                  y + imageSize / 2,
                  {
                    width: imageSize,
                    align: 'center',
                  },
                );
              currentCol++;
            }
          }

          y += imageSize + gap + 10;
        }

        y += 10; // Espacio entre items
      }

      y += 20; // Espacio entre activos fijos
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================
  private getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return '#27ae60'; // Verde
      case 'no_conforme':
        return '#e74c3c'; // Rojo
      case 'no_aplica':
        return '#f39c12'; // Naranja
      default:
        return '#95a5a6'; // Gris
    }
  }

  private getEstadoText(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'OBS.';
      case 'no_conforme':
        return 'X';
      case 'no_aplica':
        return 'N/A';
      default:
        return '-';
    }
  }

  private getUnidadMedicion(nombre: string): string {
    if (nombre.includes('Temperatura') || nombre.includes('T°')) {
      return '[°C]';
    } else if (nombre.includes('Presión')) {
      return '[PSI]';
    } else if (nombre.includes('Consumo')) {
      return '[A]';
    } else if (nombre.includes('Tensión')) {
      return '[V]';
    }
    return '';
  }

  async subirCargaMasiva(datos: any[]): Promise<SolicitarVisita[]> {
    const solicitudesCreadas: any[] = [];

    try {
      for (const dato of datos) {
        // Validar que exista el local
        const local = await this.localesRepository.findOne({
          where: { id: dato.localId },
        });
        if (!local) {
          throw new NotFoundException(
            `Local con ID ${dato.localId} no encontrado`,
          );
        }

        // Validar que exista el cliente
        const cliente = await this.clientRepository.findOne({
          where: { id: dato.clienteId },
        });
        if (!cliente) {
          throw new NotFoundException(
            `Cliente con ID ${dato.clienteId} no encontrado`,
          );
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
          fechaVisita: new Date(dato.fechaVisita),
        });

        // Guardar la solicitud
        const solicitudGuardada =
          await this.solicitarVisitaRepository.save(nuevaSolicitud);
        solicitudesCreadas.push(solicitudGuardada);
      }

      return solicitudesCreadas;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al procesar carga masiva: ${error.message}`,
      );
    }
  }
  async cambiarEstadoSolicitud(id, status) {
    this.solicitarVisitaRepository.update(id, { status });
  }

  async enviarEmail(id: number) {
    sgMail.setApiKey(
      process.env.SENDGRID_API_KEY ||
        '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',
    );

    const urlOrder = `${process.env.FRONTEND_URL}/transacciones/solicitudes-de-visita/ver-solicitud/validada/${id}`;

    const msg = {
      to: 'ignacionorambuenag@gmail.com', // Replace with the recipient's email address
      cc: ['mreyesmauricio@gmail.com', 'valericio.carrasco@soporte-ti.net'],
      from: {
        email: 'notificaciones@atlantispro.cl',
        name: 'Notificaciones Gruman',
      },
      subject: 'Se valido una nueva solicitud de visita',
      templateId: 'd-d6180d6a117f45948c9e07180779a41c',
      dynamicTemplateData: {
        urlOrder: urlOrder,
      },
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent successfully');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private async downloadImage(url: string): Promise<ImageDownloadResult> {
    try {
      // Verificar si es una URL de Firebase
      const isFirebaseUrl = url.includes('firebasestorage.googleapis.com');
      // Verificar si es una URL del servidor local
      const isLocalServerUrl = url.includes('138.255.103.');

      if (!isFirebaseUrl && !isLocalServerUrl) {
        // Si es una ruta local del sistema de archivos
        const filename = url.split('/uploads/')[1];
        const path = join(process.cwd(), 'uploads', filename);
        if (!existsSync(path)) {
          return { success: false, error: `Archivo no encontrado: ${path}` };
        }
        const data = readFileSync(path);
        return { success: true, data };
      }

      // Para URLs externas (Firebase o servidor local)
      return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol
          .get(url, (response) => {
            if (response.statusCode !== 200) {
              resolve({
                success: false,
                error: `Error al descargar imagen. Status: ${response.statusCode}`,
              });
              return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
              const data = Buffer.concat(chunks);
              resolve({ success: true, data });
            });
          })
          .on('error', (err) => {
            resolve({ success: false, error: err.message });
          });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
