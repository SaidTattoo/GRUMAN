import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { Repuesto } from '../../repuestos/repuestos.entity';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';

@Entity()
export class ItemRepuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  itemId: number;

  @ManyToOne(() => Item, item => item.itemRepuestos)
  item: Item;

  @ManyToOne(() => Repuesto)
  repuesto: Repuesto;

  @Column({ nullable: true })
  solicitarVisitaId: number;

  @ManyToOne(() => SolicitarVisita, solicitarVisita => solicitarVisita.itemRepuestos)
  solicitarVisita: SolicitarVisita;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ default: 1 })
  cantidad: number;

  
  @Column({ type: 'enum', enum: ['conforme', 'no_conforme', 'no_aplica'], default: 'no_aplica' })
  estado: string;

  @Column('simple-array', { nullable: true })
  fotos: string[];

  @CreateDateColumn()
  fechaAgregado: Date;
} 