import { Client } from "src/client/client.entity";
import { Locales } from "../locales/locales.entity";
import { SectorTrabajo } from "../sectores-trabajo/sectores-trabajo.entity";
import { TipoServicio } from "../tipo-servicio/tipo-servicio.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/users.entity";
import { ItemRepuesto } from "src/inspection/entities/item-repuesto.entity";

@Entity('solicitar_visita')
export class SolicitarVisita {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con TipoServicio (si es relevante)
  @Column({ type: 'int', nullable: true })
  tipoServicioId: number;

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
  @Column({ type: 'varchar', nullable: true, length: 255 })
  especialidad: string;

  // Fecha de ingreso
  @Column({ type: 'timestamp', nullable: true })
  fechaIngreso: Date;

  // Ticket Gruman
  @Column({ type: 'varchar', nullable: true, length: 255 })
  ticketGruman: string;

  // Observaciones
  @Column({ type: 'text', nullable: true }) // Lo hago opcional para evitar errores si no se envía
  observaciones: string;

  // Estado del ticket
  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  status: string;

  // Imagenes como un arreglo de strings
  @Column('simple-array', { nullable: true })
  imagenes: string[];

  // Fecha de creación
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAlta: Date;

  // Relación con la tabla User
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'tecnico_asignado_id' })
  tecnico_asignado: User;

  @Column({ type: 'int', nullable: true })
  tecnico_asignado_id: number;

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

  @OneToMany(() => ItemRepuesto, itemRepuesto => itemRepuesto.visita)
  itemRepuestos: ItemRepuesto[];
}
