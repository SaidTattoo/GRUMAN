import { Client } from '../client/client.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

  
  @Entity('user')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    rut: string;
  
    @ManyToMany(() => Client, client => client.users)
    @JoinTable() // Esta anotación crea la tabla intermedia
    clients: Client[];
  
    @Column({
      type: 'enum',
      enum: ['user', 'reporter', 'admin', 'superadmin'],
      default: 'user',
    })
    profile: string;
  
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
  }
  