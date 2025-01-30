import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Client } from '../client/client.entity';
import { User } from '../users/users.entity';
import { TipoServicio } from '../tipo-servicio/tipo-servicio.entity';
import { SectorTrabajo } from 'src/sectores-trabajo/sectores-trabajo.entity';
import { Locales } from 'src/locales/locales.entity';

export enum EstadoServicio {
  SOLICITUD_VISITA = 'solicitud_visita',
  PROGRAMADO = 'programado',
  EN_PROCESO = 'en_proceso',
  ESPERANDO_APROBACION = 'esperando_aprobacion',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  FINALIZADO = 'finalizada',
}

export enum TipoOrden {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
  VISITA_TECNICA = 'visita_tecnica',
  REACTIVO = 'reactivos',
}

interface Imagen {
  url: string;
  nombre: string;
  fechaSubida: Date;
  tipo: 'antes' | 'durante' | 'despues' | 'otros';
  descripcion?: string;
  usuarioSubida: number;
}

interface Documento {
  url: string;
  nombre: string;
  fechaSubida: Date;
  tipo: string;
  descripcion?: string;
  usuarioSubida: number;
}

@Entity('orden_servicio')
export class OrdenServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoOrden })
  tipoOrden: TipoOrden;

  @Column({ type: 'enum', enum: EstadoServicio })
  estado: EstadoServicio;

  @ManyToOne(() => Locales, (local) => local.id, { nullable: true })
  @JoinColumn({ name: 'localId', referencedColumnName: 'id' })
  local: Locales;

  @ManyToOne(() => Client, (cliente) => cliente.id, { nullable: true })
  @JoinColumn({ name: 'clientId', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => User, user => user.ordenesServicioTecnico)
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: User;

  @ManyToOne(() => SectorTrabajo)
  @JoinColumn({ name: 'sectorTrabajoId' })
  sectorTrabajo: SectorTrabajo;

  @ManyToOne(() => TipoServicio)
  @JoinColumn({ name: 'tipoServicioId' })
  tipoServicio: TipoServicio;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  observacionesTecnicas: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'json', nullable: true })
  detalleServicio: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costoEstimado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costoReal: number;

  @Column({ type: 'boolean', default: false })
  requiereAprobacion: boolean;

  @Column({ type: 'json', nullable: true })
  imagenes: Imagen[];

  @Column({ type: 'json', nullable: true })
  documentos: Documento[];

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFinalizacion: Date;

  @Column({ type: 'json', nullable: true })
  repuestos: {
    id: number;
    cantidad: number;
    costo: number;
  }[];

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({ type: 'text', nullable: true })
  motivoRechazo: string;

  @ManyToOne(() => User, user => user.ordenesServicioRechazadas, { nullable: true })
  @JoinColumn({ name: 'usuarioRechazoId' })
  usuarioRechazo: User;

  @Column({ type: 'timestamp', nullable: true })
  fechaRechazo: Date;

  @ManyToOne(() => User, user => user.ordenesServicioAprobadas, { nullable: true })
  @JoinColumn({ name: 'usuarioAprobacionId' })
  usuarioAprobacion: User;

  @Column({ type: 'timestamp', nullable: true })
  fechaAprobacion: Date;

  @Column({ type: 'text', nullable: true })
  ticket_gruman: string;
} 