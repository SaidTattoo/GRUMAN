import { Client } from "../client/client.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SolicitarVisita } from "../solicitar-visita/solicitar-visita.entity";

@Entity('facturacion')
export class Facturacion {
  @PrimaryGeneratedColumn({ name: 'id_facturacion' })
  id_facturacion: number;

  @ManyToOne(() => Client, (cliente) => cliente.facturaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Client;

  @Column({ type: 'varchar', length: 50, nullable: false, name: 'mes' })
  mes: string;

  @Column({ type: 'date', nullable: false, name: 'fecha_inicio' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: false, name: 'fecha_termino' })
  fecha_termino: Date;

  @Column({ type: 'int', default: 0, name: 'hh' })
  hh: number;

  @OneToMany(() => SolicitarVisita, solicitud => solicitud.facturacion)
  solicitudes: SolicitarVisita[];
}