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
        'activoFijoRepuestos',
        'activoFijoRepuestos.activoFijo',
        'activoFijoRepuestos.detallesRepuestos',
        'activoFijoRepuestos.detallesRepuestos.repuesto',
        'client',
      ],
    });

    solicitudBase.local.totalActivoFijoLocales =
      solicitudBase.local.activoFijoLocales.length || 0;

    if (solicitudBase.local.activoFijoLocales.length > 0) {
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
      is_climate: data.is_climate || false,
      climate_data: data.is_climate ? JSON.stringify(data.data) : null,
      data_normal: data.is_climate ? null : JSON.stringify(data.data),
      signature: data.firma || null
    });
    const savedResponseChecklist = await this.responseChecklistRepository.save(responseChecklist);
    const updatedSolicitudVisita = await this.solicitarVisitaRepository.update(id, {
      status: SolicitudStatus.FINALIZADA,
      fecha_hora_fin_servicio: new Date(),
      firma_cliente: data.firma,
      comentario_general: data.comentario_general || "",
    });

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
      where: { solicitud_visita_id: id }
    });

    console.log('responseChecklist', responseChecklist);

    if (!responseChecklist) {
      throw new NotFoundException('No se encontró el checklist de clima');
    }


    const responseSave = await this.responseChecklistRepository.update(
      responseChecklist.id,
      {
        is_climate: data.is_climate || false,
        climate_data: data.is_climate ? JSON.stringify(data.data.climate_data) : null,
        data_normal: data.is_climate ? null : JSON.stringify(data.data.data_normal),
      },
    );

    console.log('responseSave', responseSave);

    const updatedChecklist = await this.responseChecklistRepository.findOne({
      where: { solicitud_visita_id: id }
    });

    if (!updatedChecklist) {
      return {
        success: false,
        message: 'No se pudo actualizar el checklist',
        data: null
      };
    }

    return {
      success: true,
      message: 'Checklist actualizado correctamente',
      data: updatedChecklist
    };
  }

  async getResponseChecklist(id: any) {
    const responseChecklist = await this.responseChecklistRepository.findOne({
      where: { solicitud_visita_id: id }
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
    tipo_mantenimiento: string,
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

      // Add tipo_mantenimiento filter if provided
      if (tipo_mantenimiento && tipo_mantenimiento !== 'todos') {
        whereClause.tipo_mantenimiento = tipo_mantenimiento;
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
        for (let i = 0; i < equiposHeaders.length; i++) {
          doc
            .font(styles.tableHeader.font)
            .fontSize(styles.tableHeader.size)
            .fillColor('#222')
            .text(equiposHeaders[i], x + 8, currentY + 6, {
              width: colWidths[i] - 10,
            });
          x += colWidths[i];
          if (i < equiposHeaders.length - 1) {
            doc
              .moveTo(x, currentY)
              .lineTo(
                x,
                currentY +
                  rowHeight * (solicitud.activoFijoRepuestos.length + 1),
              )
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();
          }
        }
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

      if (solicitud.firma_cliente) {
        // --- FIRMA DEL CLIENTE ---
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

      // --- LISTADO DE REPUESTOS UTILIZADOS ---
      if (solicitud.itemRepuestos?.length > 0) {
        // Verificar si hay suficiente espacio para la sección
        if (currentY + 100 > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .font(styles.header.font)
          .fontSize(styles.header.size)
          .fillColor(styles.header.fillColor)
          .text('REPUESTOS UTILIZADOS', tableX, currentY);
        currentY += 18;

        // Encabezados
        const repuestosHeaders = [
          'Artículo',
          'Marca',
          'Familia',
          'Código',
          'Cantidad',
          'Precio',
        ];
        const colWidths = [
          contentWidth * 0.25,
          contentWidth * 0.15,
          contentWidth * 0.15,
          contentWidth * 0.15,
          contentWidth * 0.15,
          contentWidth * 0.15,
        ];

        // Borde exterior
        doc.save();
        doc
          .roundedRect(
            tableX,
            currentY,
            contentWidth,
            rowHeight * (solicitud.itemRepuestos.length + 1),
            6,
          )
          .lineWidth(0.7)
          .stroke(borderColor);
        doc.restore();

        // Encabezados
        let x = tableX;
        for (let i = 0; i < repuestosHeaders.length; i++) {
          doc
            .font(styles.tableHeader.font)
            .fontSize(styles.tableHeader.size)
            .fillColor('#222')
            .text(repuestosHeaders[i], x + 8, currentY + 6, {
              width: colWidths[i] - 10,
            });
          x += colWidths[i];
          if (i < repuestosHeaders.length - 1) {
            doc
              .moveTo(x, currentY)
              .lineTo(
                x,
                currentY + rowHeight * (solicitud.itemRepuestos.length + 1),
              )
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();
          }
        }

        // Línea horizontal después de los encabezados
        doc
          .moveTo(tableX, currentY + rowHeight)
          .lineTo(tableX + contentWidth, currentY + rowHeight)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();

        // Filas de repuestos
        for (let i = 0; i < solicitud.itemRepuestos.length; i++) {
          const repuesto = solicitud.itemRepuestos[i];
          let y = currentY + rowHeight * (i + 1);
          let x = tableX;

          // Preparar los valores a mostrar
          const articulo = repuesto.repuesto?.articulo || 'N/A';
          const marca = repuesto.repuesto?.marca || 'N/A';
          const familia = repuesto.repuesto?.familia || 'N/A';
          const codigo = repuesto.repuesto?.codigoBarra || 'N/A';
          const cantidad = repuesto.cantidad?.toString() || '0';
          const precio = repuesto.precio_venta
            ? `$${Number(repuesto.precio_venta).toLocaleString('es-CL')}`
            : repuesto.repuesto?.precio_venta
              ? `$${Number(repuesto.repuesto.precio_venta).toLocaleString('es-CL')}`
              : 'N/A';

          const values = [articulo, marca, familia, codigo, cantidad, precio];

          for (let j = 0; j < values.length; j++) {
            doc
              .font(styles.tableCell.font)
              .fontSize(styles.tableCell.size)
              .fillColor('#333')
              .text(values[j], x + 8, y + 6, { width: colWidths[j] - 10 });
            x += colWidths[j];
          }

          // Línea horizontal entre filas
          if (i < solicitud.itemRepuestos.length - 1) {
            doc
              .moveTo(tableX, y + rowHeight)
              .lineTo(tableX + contentWidth, y + rowHeight)
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();
          }
        }

        currentY += rowHeight * (solicitud.itemRepuestos.length + 1) + 16;

        // Información adicional (Total, condiciones, etc.)
        let totalRepuestos = 0;
        solicitud.itemRepuestos.forEach((item) => {
          const precio =
            item.precio_venta ||
            (item.repuesto ? Number(item.repuesto.precio_venta) : 0);
          totalRepuestos += precio * item.cantidad;
        });

        if (totalRepuestos > 0) {
          doc
            .font(styles.tableHeader.font)
            .fontSize(styles.tableHeader.size)
            .fillColor('#222')
            .text(
              `Total repuestos: $${totalRepuestos.toLocaleString('es-CL')}`,
              tableX,
              currentY,
              { align: 'right', width: contentWidth },
            );
          currentY += 20;
        }
      }

      // --- LISTADO DE ITEMS DE INSPECCIÓN ---
      console.log(
        'solicitud.client.listaInspeccion',
        solicitud.client?.listaInspeccion,
      );
      if (solicitud.client?.listaInspeccion?.length > 0) {
        for (const lista of solicitud.client.listaInspeccion) {
          // Verificar todos los ítems para estimar altura total de la sección
          let alturaEstimadaSeccion = 20; // Altura del título

          // Estimar altura para al menos el primer ítem
          if (lista.items?.length > 0) {
            const primerItem = lista.items[0];
            alturaEstimadaSeccion += 25; // Título del ítem

            // Al menos el primer sub-ítem del primer ítem (si existe)
            if (primerItem.subItems?.length > 0) {
              alturaEstimadaSeccion += 100; // Altura aproximada de un sub-ítem
            }
          }

          // Si no hay espacio para el título y al menos un ítem, saltar página
          if (currentY + alturaEstimadaSeccion > doc.page.height - 50) {
            doc.addPage();
            currentY = 50;
          }

          // Dibujar título de sección con fondo gris
          doc.save();
          doc
            .roundedRect(tableX - 10, currentY - 5, contentWidth + 20, 25, 5)
            .fillColor('#f2f2f2')
            .fill();
          doc.restore();

          doc
            .font(styles.header.font)
            .fontSize(styles.header.size)
            .fillColor(styles.header.fillColor)
            .text(lista.name, tableX, currentY + 2, {
              width: contentWidth,
              align: 'center',
            });
          currentY += 27;

          // Iterar por los ítems
          for (const item of lista.items) {
            // Estimar altura de este ítem y sus subitems
            let alturaEstimadaItem = 25; // Título del ítem
            if (item.subItems?.length > 0) {
              // Estimar altura para al menos 1 subitem
              alturaEstimadaItem += Math.min(item.subItems.length, 2) * 110;
            }

            // Verificar si hay espacio para el ítem completo o al menos su título y un subítem
            if (currentY + alturaEstimadaItem > doc.page.height - 40) {
              doc.addPage();
              currentY = 50;
            }

            // Título del item con fondo suave
            doc.save();
            doc
              .roundedRect(tableX - 5, currentY - 5, contentWidth + 10, 25, 3)
              .fillColor('#e0e0e0')
              .fill();
            doc.restore();

            doc
              .font(styles.subtitle.font)
              .fontSize(styles.subtitle.size)
              .fillColor(styles.subtitle.fillColor)
              .text(item.name, tableX, currentY, {
                width: contentWidth,
                align: 'left',
              });
            currentY += 30;

            // Formato para subitems (diseño como en el ejemplo)
            for (const subItem of item.subItems) {
              // Obtener estado y comentario
              let estado = 'Sin estado';
              try {
                const estadoRes = await this.getNameStatus(subItem.estado);
                console.log('estadoRes', estadoRes);
                estado = estadoRes || 'Sin estado';
              } catch (e) {
                estado = 'Sin estado';
              }
              const comentario = subItem.comentario || 'Sin observaciones';

              // Color según estado
              let estadoColor = '#4CAF50'; // Verde por defecto (conforme)
              if (estado.toLowerCase().includes('no conforme')) {
                estadoColor = '#F44336'; // Rojo
              } else if (estado.toLowerCase().includes('no aplica')) {
                estadoColor = '#FF9800'; // Naranja
              } else if (estado.toLowerCase().includes('-')) {
                estadoColor = '#bbbbbb'; // Naranja
              }

              // Calcular alturas
              const subItemName = subItem.name || 'Sin información';
              const nameHeight = doc.heightOfString(subItemName, {
                width: contentWidth - 120, // Ajustado para estado más pequeño
                lineGap: 1,
              });

              const observacionesTexto = 'Observaciones: ' + comentario;
              const observacionesHeight = doc.heightOfString(
                observacionesTexto,
                {
                  width: contentWidth - 30,
                  lineGap: 1,
                },
              );

              // Altura total del bloque
              const totalHeight =
                Math.max(nameHeight, 22) + observacionesHeight + 15;

              // Verificar si hay espacio
              if (currentY + totalHeight + 20 > doc.page.height - 40) {
                doc.addPage();
                currentY = 50;
              }

              // ---- DIBUJAR SUBITEM ----

              // 1. Nombre del subitem (a la izquierda)
              doc
                .font('Helvetica-Bold')
                .fontSize(styles.tableCell.size)
                .fillColor('#333')
                .text(subItemName, tableX, currentY, {
                  width: contentWidth - 120,
                  lineGap: 1,
                });

              // Calcular altura real del nombre para centrar el estado
              const actualNameHeight = Math.min(
                doc.heightOfString(subItemName, {
                  width: contentWidth - 120,
                  lineGap: 1,
                }),
                20, // altura máxima para considerar
              );

              // 2. Estado (botón a la derecha, más pequeño y centrado)
              const estadoHeight = 18; // Altura reducida del botón
              const estadoY =
                currentY + actualNameHeight / 2 - estadoHeight / 2; // Centrado vertical

              // Dibujar el botón de estado
              doc.save();
              doc
                .roundedRect(
                  tableX + contentWidth - 110,
                  estadoY,
                  110,
                  estadoHeight,
                  3,
                )
                .fillColor(estadoColor)
                .fill();
              doc.restore();

              // Texto del estado centrado (usando align center y ajustando Y manualmente)
              const estadoTexto = estado.toUpperCase();

              // Establecer la fuente antes de calcular dimensiones
              doc.font('Helvetica-Bold').fontSize(styles.tableCell.size - 1);

              // Centrado vertical calculado manualmente
              // Para el centrado vertical perfecto, ajustamos el valor Y
              const verticalOffset = estadoHeight * 0.3; // Aproximadamente 30% de la altura del botón

              doc
                .fillColor('#FFFFFF')
                .text(
                  estadoTexto,
                  tableX + contentWidth - 110,
                  estadoY + verticalOffset,
                  {
                    width: 110,
                    align: 'center',
                  },
                );

              // Avanzar a las observaciones
              currentY += Math.max(nameHeight, 22) + 5;

              // Ya no hay línea divisoria aquí

              // 3. Observaciones
              doc
                .font('Helvetica-Bold')
                .fontSize(styles.tableCell.size - 1)
                .fillColor('#333')
                .text('Observaciones: ', tableX, currentY, {
                  continued: true,
                });

              doc
                .font('Helvetica')
                .fontSize(styles.tableCell.size - 1)
                .fillColor('#666')
                .text(comentario);

              // Avanzar posición Y después de las observaciones
              currentY += observacionesHeight + 5;

              // Línea divisoria entre subitems completos
              doc
                .moveTo(tableX, currentY)
                .lineTo(tableX + contentWidth, currentY)
                .strokeColor('#e0e0e0')
                .stroke();

              currentY += 10; // Espacio entre subitems
            }

            // Espacio adicional entre items principales
            currentY += 15;
          }
        }
      }

      const hasPhotos = solicitud.itemFotos?.some((f) => f.fotos?.length);
      if (hasPhotos) {
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
        const imageSize = 160;
        const gap = 20;
        const imagesPerRow = 3;
        const xPositions = Array.from(
          { length: imagesPerRow },
          (_, i) => marginLeft + i * (imageSize + gap),
        );

        for (const item of solicitud.itemFotos) {
          if (!item.fotos?.length) continue;

          if (y + imageSize + 40 > doc.page.height - 60) {
            doc.addPage();
            y = 80;
          }

          const nameItem = await this.getNameItem(item.itemId);
          doc
            .rect(marginLeft, y, pageWidth - marginLeft * 2, 25)
            .fillColor('#f5f5f5')
            .fill();
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#333')
            .text(nameItem, marginLeft + 10, y + 7);
          y += 35;

          let currentCol = 0;

          for (const fotoUrl of item.fotos) {
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
              }

              // Marco con sombra para la imagen
              doc
                .save()
                .rect(xPositions[currentCol], y, imageSize, imageSize)
                .fillColor('#fff')
                .fill()
                .lineWidth(1)
                .strokeColor('#ccc')
                .stroke();

              // Imagen cuadrada con fit usando el buffer descargado
              doc.image(imageResult.data, xPositions[currentCol], y, {
                fit: [imageSize, imageSize],
                align: 'center',
                valign: 'center',
              });

              currentCol++;
            } catch (err) {
              doc
                .font('Helvetica')
                .fontSize(8)
                .fillColor('#ff0000')
                .text(
                  `Error: ${err.message}`,
                  xPositions[currentCol],
                  y + imageSize / 2,
                );
              currentCol++;
            }
          }

          y += imageSize + gap * 2;
        }
      }

      // Footer
      // const footerY = doc.page.height - 50;
      // doc.font(styles.small.font)
      //    .fontSize(styles.small.size)
      //    .fillColor(styles.small.fillColor)
      //    .text('Documento generado automáticamente por el Sistema de Gestión Técnica',
      //          marginLeft, footerY);

      doc.end();
      return new Promise((resolve, reject) => {
        doc.on('end', () =>
          finalBuffer ? resolve(finalBuffer) : reject(new Error('PDF vacío')),
        );
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error generando PDF: ${err.message}`,
      );
    }
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

  private getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'conforme':
        return '#4CAF50';
      case 'no conforme':
        return '#F44336';
      case 'no aplica':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
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
