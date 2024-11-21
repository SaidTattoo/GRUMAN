import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  precio: number;
}
