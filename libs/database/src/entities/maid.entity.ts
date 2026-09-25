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
import { PickupPoint } from './pickup-point.entity';

@Entity('maids')
export class Maid {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email?: string;

  @Column({ unique: true })
  @Index()
  phone!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  idDocument?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ name: 'pickup_point_id', nullable: true })
  pickupPointId?: number;

  @ManyToOne(() => PickupPoint, (pp) => pp.maids, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'pickup_point_id' })
  pickupPoint?: PickupPoint;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
