import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';   

@Entity()
export class SectorTrabajoDefault {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'varchar', length: 255 })
    nombre: string;
  
    @Column({ type: 'boolean', default: false })
    deleted: boolean;
  
    @Column({ type: 'int', default  : 0 })
    local: number;
}