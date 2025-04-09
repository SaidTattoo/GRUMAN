import { ClienteRepuesto } from 'src/cliente-repuesto/cliente-repuesto.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';


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

  

  @OneToMany(() => ClienteRepuesto, clienteRepuesto => clienteRepuesto.repuesto)
  clienteRepuestos: ClienteRepuesto[];
}
