import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Maid, BaseService } from '@libs/index';
import { CreateMaidDto } from './dto/create-maid.dto';
import { UpdateMaidDto } from './dto/update-maid.dto';

@Injectable()
export class MaidService extends BaseService<Maid> {
  constructor(
    @InjectRepository(Maid)
    repository: Repository<Maid>,
  ) {
    super(repository);
  }

  override async findAll(options?: any) {
    return super.findAll({
      ...options,
      relations: options?.relations ?? ['pickupPoint'],
      searchableFields: ['name', 'email', 'phone'],
    });
  }

  override async findOne(
    id: number | string,
    withDeleted = false,
    relations?: any,
    select?: any,
  ): Promise<Maid> {
    return super.findOne(
      id,
      withDeleted,
      relations ?? ['pickupPoint'],
      select,
    );
  }

  /**
   * Attach multiple maids to a specific pickup point.
   */
  async attachToPickupPoint(
    maidIds: number[],
    pickupPointId: number,
  ): Promise<void> {
    if (!maidIds || maidIds.length === 0) return;
    await this.repository.update(
      { id: In(maidIds) },
      { pickupPointId },
    );
  }

  /**
   * Detach all maids previously associated with a pickup point.
   */
  async detachFromPickupPoint(pickupPointId: number): Promise<void> {
    await this.repository.update(
      { pickupPointId },
      { pickupPointId: null as any },
    );
  }
}

