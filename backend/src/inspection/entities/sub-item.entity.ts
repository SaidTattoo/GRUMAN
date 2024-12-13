import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class SubItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Item, item => item.subItems)
  item: Item;

  @Column({ default: false })
  disabled: boolean;
} 