import { Client } from "src/client/client.entity";
import { Locales } from "../locales/locales.entity";
import { SectorTrabajo } from "../sectores-trabajo/sectores-trabajo.entity";
import { TipoServicio } from "../tipo-servicio/tipo-servicio.entity";
import { Sla } from "../sla/entity/sla.entity";

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/users.entity";
import { ItemRepuesto } from "src/inspection/entities/item-repuesto.entity";
import { ItemFotos } from 'src/inspection/entities/item-fotos.entity';
import { CausaRaiz } from "src/causa-raiz/causa-raiz.entity";
import { ActivoFijoRepuestos } from "src/activo-fijo-repuestos/entities/activo-fijo-repuestos.entity";
import { ChecklistClima } from "src/checklist_clima/checklist_clima.entity";
import { ItemEstado } from "src/inspection/entities/item-estado.entity";
import { Facturacion } from "src/facturacion/facturacion.entity";
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

export enum SolicitudStatus {
    PENDIENTE = 'pendiente',
    APROBADA = 'aprobada',
    RECHAZADA = 'rechazada',
    EN_SERVICIO = 'en_servicio',
    FINALIZADA = 'finalizada',
    VALIDADA = 'validada',
    REABIERTA = 'reabierta',
    ATENDIDA_EN_PROCESO = 'atendida_en_proceso',
    ELIMINADA = 'eliminada'
}

@Entity('solicitar_visita')
export class SolicitarVisita {
  @PrimaryGeneratedColumn()
  id: number;

  // Tipo de mantenimiento (reactivo, preventivo, programado)
  @Column({default: null, nullable: true })
  tipo_mantenimiento: string;

  // Relación con TipoServicio (si es relevante)
  @ManyToOne(() => TipoServicio)
  @JoinColumn({ name: 'tipoServicioId' })
  tipoServicio: TipoServicio;
 
  @ManyToOne(() => Sla)
  @JoinColumn({ name: 'tipoSolicitudId' })
  tipoSolicitud: Sla;

  @Column({ nullable: true })
  tipoServicioId: number;

  @Column({ nullable: true })
  tipoSolicitudId: number;

  // Relación con la tabla Locales
  @ManyToOne(() => Locales, (local) => local.id, { nullable: true })
  @JoinColumn({ name: 'localId', referencedColumnName: 'id' })
  local: Locales;

  // Relación con la tabla Client
  @ManyToOne(() => Client, (cliente) => cliente.id, { nullable: true })
  @JoinColumn({ name: 'clientId', referencedColumnName: 'id' })
  client: Client;

  // SectorTrabajoId como columna independiente
  @Column({ type: 'int', nullable: true })
  sectorTrabajoId: number;

  // Especialidad como texto opcional
  @Column({ type: 'int', nullable: true })
  especialidad: number;

  // Fecha de ingreso
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaIngreso: Date;

  // Ticket Gruman
  @Column({ type: 'varchar', nullable: true, length: 255 })
  ticketGruman: string;

  // Observaciones
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Estado del ticket
  @Column({
    type: 'enum',
    enum: SolicitudStatus,
    default: SolicitudStatus.PENDIENTE
  })
  status: SolicitudStatus;

  // Valor por local
  @Column({ type: 'varchar', nullable: true, default: null })
  valorPorLocal: string;

  // Imagenes como un arreglo de strings
  @Column('simple-array', { nullable: true })
  imagenes: string[];

  // Fecha de creación
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaVisita: Date;

  // Relación con la tabla User
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'tecnico_asignado_id' })
  tecnico_asignado: User;

  @Column({ type: 'int', nullable: true })
  tecnico_asignado_id: number;

  // Relación con la tabla User
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'tecnico_asignado_id_2' })
  tecnico_asignado_2: User;

  @Column({ type: 'int', nullable: true })
  tecnico_asignado_id_2: number;

  @Column({ type: 'text', nullable: true })
  observacion_rechazo: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_inicio_servicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_fin_servicio: Date;

  @Column({ type: 'text', nullable: true })
  firma_cliente: string;

  @Column({ type: 'text', nullable: true })
  latitud_movil: string; 

  @Column({ type: 'text', nullable: true })
  longitud_movil: string; 

  @OneToMany(() => ItemRepuesto, itemRepuesto => itemRepuesto.solicitarVisita)
  itemRepuestos: ItemRepuesto[];

  @OneToMany(() => ItemFotos, itemFotos => itemFotos.solicitarVisita)
  itemFotos: ItemFotos[];

  @OneToMany(() => ItemEstado, itemEstado => itemEstado.solicitarVisita)
  itemEstados: ItemEstado[];

  // Relación con User para aprobada_por
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'aprobada_por_id' })
  aprobada_por: User;

  @Column({ type: 'int', nullable: true })
  aprobada_por_id: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_aprobacion: Date;

  // Relación con User para rechazada_por
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'rechazada_por_id' })
  rechazada_por: User;

  @Column({ type: 'int', nullable: true })
  rechazada_por_id: number;

  // Relación con User para validada_por
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'validada_por_id' })
  validada_por: User;

  @Column({ type: 'int', nullable: true })
  validada_por_id: number;

  // Relación con User para reabierta_por
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'reabierta_por_id' })
  reabierta_por: User;

  @Column({ type: 'int', nullable: true })
  reabierta_por_id: number;

  // Relación con User para generada_por
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'generada_por_id' })
  generada_por: User;

  // Relación con User para generada_por
  @ManyToOne(() => TipoServicio, (tipoServicio) => tipoServicio.id, { nullable: true })
  @JoinColumn({ name: 'tipoServicioId' })
  tipo_servicio: TipoServicio;

  @ManyToOne(() => Sla, (tipoSolicitud) => tipoSolicitud.id, { nullable: true })
  @JoinColumn({ name: 'tipoSolicitudId' })
  tipo_solicitud: Sla;

  @Column({ type: 'int', nullable: true })
  generada_por_id: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_validacion: Date;

  @Column({ type: 'text', nullable: true })
  registroVisita: string;

  @Column({
    type: 'boolean',
    name: 'estado',
    default: true
  })
  estado: boolean;

  // Relación con CausaRaiz
  @ManyToOne(() => CausaRaiz, { nullable: true })
  @JoinColumn({ name: 'causaRaizId' })
  causaRaiz: CausaRaiz;

  @Column({ 
    type: 'int', 
    nullable: true,
    comment: 'ID de la causa raíz que originó la falla'
  })
  causaRaizId: number;

  @OneToMany(() => ActivoFijoRepuestos, afr => afr.solicitarVisita)
  activoFijoRepuestos: ActivoFijoRepuestos[];

  @OneToMany(() => ChecklistClima, checklist => checklist.solicitud)
  checklistsClima: ChecklistClima[];

  @ManyToOne(() => Facturacion, facturacion => facturacion.solicitudes)
  @JoinColumn({ name: 'facturacion_id' })
  facturacion: Facturacion;

  @Column({ type: 'int', nullable: true })
  facturacion_id: number;

  @Column({ type: 'text', nullable: true })
  garantia: string;

  @Column({ type: 'text', nullable: true })
  turno: string;

  @Column({ type: 'text', nullable: true })
  estado_solicitud: string;

  @Column({ type: 'text', nullable: true })
  image_ot: string;


  clima: boolean;
  // Agregar la relación con ActivoFijoLocal
  @ManyToOne(() => ActivoFijoLocal, { nullable: true })
  @JoinColumn({ name: 'activo_fijo_id' })
  activoFijo: ActivoFijoLocal;

  @Column({ type: 'int', nullable: true })
  activo_fijo_id: number;

  @Column({ type: 'text', nullable: true })
  comentario_general: string;

}
 