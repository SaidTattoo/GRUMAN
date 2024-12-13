import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('especialidad')
export class Especialidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToMany(() => User, user => user.especialidades)
  users: User[];

  @Column({ default: false })
  deleted: boolean;
}
