import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Governorate } from './governorate.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'governorate_id' })
  governorateId!: number;

  @ManyToOne(() => Governorate, (gov) => gov.areas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'governorate_id' })
  governorate?: Governorate;

  @Column({ name: 'name_en' })
  nameEn!: string;

  @Column({ name: 'name_ar' })
  nameAr!: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  long?: number;

  @ManyToMany('PickupPoint', 'areas')
  pickupPoints?: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

