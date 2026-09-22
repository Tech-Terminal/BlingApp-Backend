import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Role } from './role.entity';

@Entity('admins')
export class Admin {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    email!: string

    @Column({ nullable: true })
    password?: string

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ default: true })
    isActive!: boolean

    @Column()
    roleId!: number;

    @Column({ nullable: true })

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

    @DeleteDateColumn()
    deletedAt?: Date

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'roleId' })
    role!: Role;

}