import { Client } from "../client/client.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('facturacion')
export class Facturacion {
  @PrimaryGeneratedColumn()
  id_facturacion: number;

  @ManyToOne(() => Client, (cliente) => cliente.facturaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Client;

  @Column({ type: 'varchar', length: 50, nullable: false })
  mes: string;

  @Column({ type: 'date', nullable: false })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: false })
  fecha_termino: Date;

  @Column({ type: 'int', default: 0 })
  hh: number;
}