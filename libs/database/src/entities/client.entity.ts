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
import { Address } from './address.entity';

@Entity('clients')
export class Client {
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

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Address, (address) => address.client)
  addresses?: Address[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
