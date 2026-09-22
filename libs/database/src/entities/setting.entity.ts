import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SETTING_KEYS } from '@libs/index';

@Entity('settings')
export class Setting {

    @PrimaryGeneratedColumn()
    id!: number

    @Index({ unique: true })
    @Column()
    key!: string

    @Column({ type: 'text', nullable: true })
    value?: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
