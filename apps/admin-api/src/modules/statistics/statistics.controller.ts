import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Cacheable } from '@libs/common/src/decorators/cacheable.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @Cacheable({ttlInSeconds: 300, key: 'admin_stats_latest'})
  async getStatistics() {
    return await this.statisticsService.getStatistics();
  }
}
