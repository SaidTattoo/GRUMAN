import { ClienteRepuesto } from 'src/cliente-repuesto/cliente-repuesto.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DetalleRepuestoActivoFijo } from '../activo-fijo-repuestos/entities/detalle-repuesto-activo-fijo.entity';

@Entity('repuestos')
export class Repuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  familia: string;

  @Column()
  articulo: string;

  @Column()
  marca: string;

  @Column()
  codigoBarra: string;
  
  @Column('decimal', { precision: 10, scale: 2 })
  precio_compra: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_venta: number;

  @Column({ default: false })
  valor_uf :boolean

  @Column({ default: false })
  clima :boolean

  @Column({
    type: 'enum',
    enum: ['APP', 'APK', 'BOTH'],
    default: 'APP'
  })
  is_available: 'APP' | 'APK' | 'BOTH';

  @OneToMany(() => ClienteRepuesto, clienteRepuesto => clienteRepuesto.repuesto)
  clienteRepuestos: ClienteRepuesto[];

  @OneToMany(() => DetalleRepuestoActivoFijo, detalle => detalle.repuesto)
  detallesActivoFijo: DetalleRepuestoActivoFijo[];
}
