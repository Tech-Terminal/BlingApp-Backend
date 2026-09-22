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
import { Governorate } from './governorate.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'governorate_id' })
  governorateId!: number;

  @ManyToOne(() => Governorate, (gov) => gov.areas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'governorate_id' })
  governorate?: Governorate;

  @Column({ name: 'name_en' })
  nameEn!: string;

  @Column({ name: 'name_ar' })
  nameAr!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
