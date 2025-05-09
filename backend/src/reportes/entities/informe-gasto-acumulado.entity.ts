import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('informe_gasto_acumulado', { synchronize: false })
export class InformeGastoAcumulado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column() // SERVICE | REPLACEMENT | HEADER | TOTAL |
  type_service: string;

  @Column()
  currency: string;

  @Column()
  monthly_cost: number;

  @Column()
  accumulated_cost: number;

  @Column()
  percentage_cost_diff: number;
}
