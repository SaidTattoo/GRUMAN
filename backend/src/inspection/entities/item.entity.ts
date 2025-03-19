import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Section } from './section.entity';
import { SubItem } from './sub-item.entity';
import { ItemRepuesto } from './item-repuesto.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Section, section => section.items)
  section: Section;
  @Column({ default: false })
  disabled: boolean;
  @OneToMany(() => SubItem, subItem => subItem.item, { cascade: true })
  subItems: SubItem[];
  @OneToMany(() => ItemRepuesto, itemRepuesto => itemRepuesto.itemId)
  itemRepuestos: ItemRepuesto[];
} 