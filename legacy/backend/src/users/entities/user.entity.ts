import { Cliente } from '../../clientes/clientes.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Index } from 'typeorm';



@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  })
  profile: string;

  @ManyToMany(() => Cliente)
  @JoinTable({
    name: 'user_clients',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'client_id',
      referencedColumnName: 'id'
    }
  })
  clients: Cliente[];
}