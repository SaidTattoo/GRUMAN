import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Repuesto } from '../../repuestos/repuestos.entity';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';
import { ItemFotos } from './item-fotos.entity';

@Entity()
export class ItemRepuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  itemId: number;

  @ManyToOne(() => Item, item => item.itemRepuestos)
  item: Item;

  @ManyToOne(() => Repuesto)
  @JoinColumn({ name: 'repuestoId' })
  repuesto: Repuesto;

  @Column({ type: 'int' })
  repuestoId: number;

  @Column({ type: 'int', nullable: false })
  solicitarVisitaId: number;

  @ManyToOne(() => SolicitarVisita, solicitarVisita => solicitarVisita.itemRepuestos)
  @JoinColumn({ name: 'solicitarVisitaId' })
  solicitarVisita: SolicitarVisita;

  @Column({ nullable: true })
  comentario: string;

  @Column()
  cantidad: number;

  @Column({ nullable: true })
  estado: string;

  @Column('simple-array', { nullable: true })
  fotos: string[];

  @CreateDateColumn()
  fechaAgregado: Date;

  getFotos(itemFotos: ItemFotos[]): string[] {
    const fotosDelItem = itemFotos?.find(foto => foto.itemId === this.itemId);
    return fotosDelItem?.fotos || null;
  }
} 