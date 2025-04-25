import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('informes_consumo',{synchronize:false})
export class InformesConsumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requerimiento: string;

  @Column()
  tipo_servicio: string;

  @Column()
  local: string;

  @Column()
  repuesto: string;

  @Column()
  cliente: string;

  @Column()
  cliente_id: number;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_compra: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_venta_cliente: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_cliente: number;

  @Column({ type: 'date' })
  fechaVisita: Date;

  @Column()
  nombre_tecnico: string;

  @Column()
  mes_facturacion?: string;
}