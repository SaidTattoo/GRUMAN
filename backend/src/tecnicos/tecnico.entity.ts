import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tecnico')
export class Tecnico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column()
  rut: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
