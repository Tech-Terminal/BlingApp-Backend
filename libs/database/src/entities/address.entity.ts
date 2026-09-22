import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from './client.entity';
import { Governorate } from './governorate.entity';
import { Area } from './area.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  clientId!: number;

  @ManyToOne(() => Client, (client) => client.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client?: Client;

  @Column()
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  long!: number;

  @Index()
  @Column()
  governorateId!: number;

  @ManyToOne(() => Governorate, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'governorateId' })
  governorate?: Governorate;

  @Index()
  @Column()
  areaId!: number;

  @ManyToOne(() => Area, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @Column()
  street!: string;

  @Column()
  block!: string;

  @Column()
  houseNumber!: string;

  @Column({ type: 'text', nullable: true })
  additionalDetails?: string;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
