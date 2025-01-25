import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { Repuesto } from '../../repuestos/repuestos.entity';

@Entity()
export class ItemRepuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Item, item => item.itemRepuestos)
  item: Item;

  @ManyToOne(() => Repuesto)
  repuesto: Repuesto;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ default: 1 })
  cantidad: number;

  @CreateDateColumn()
  fechaAgregado: Date;
} 