import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Area } from './area.entity';

@Entity('governorates')
export class Governorate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name_en' })
  nameEn!: string;

  @Column({ name: 'name_ar' })
  nameAr!: string;

  @OneToMany(() => Area, (area) => area.governorate)
  areas?: Area[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
