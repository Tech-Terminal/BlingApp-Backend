import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Maid } from './maid.entity';
import { Area } from './area.entity';

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

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => Maid, (maid) => maid.pickupPoint)
  maids?: Maid[];

  @ManyToMany(() => Area, (area) => area.pickupPoints)
  @JoinTable({
    name: 'pickup_points_areas',
    joinColumn: { name: 'pickup_point_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'area_id', referencedColumnName: 'id' },
  })
  areas?: Area[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
