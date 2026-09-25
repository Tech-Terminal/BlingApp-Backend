import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Maid } from './maid.entity';

@Entity('pick_up_points')
export class PickupPoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  label!: string;

  @Column({ name: 'street_name', nullable: true })
  streetName?: string;

  @Column({ name: 'building_number', nullable: true })
  buildingNumber?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  long?: number;

  @Column('decimal', { precision: 8, scale: 2, default: 5 })
  distance!: number; // Distance covered in Km

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => Maid, (maid) => maid.pickupPoint)
  maids?: Maid[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
