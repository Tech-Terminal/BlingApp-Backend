import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Entity } from "typeorm";

@Entity("roles")
export class Role {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({ type: 'jsonb', default: {} })
    permissions!: any;

    @Column({ default: false })
    isSuperAdmin!: boolean;

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

    @DeleteDateColumn()
    deletedAt?: Date
}
