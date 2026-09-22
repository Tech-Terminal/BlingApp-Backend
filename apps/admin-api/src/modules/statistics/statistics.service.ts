import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getStatistics() {
    // TODO: Implement actual Bling statistics (e.g. Total Orders, Services, Customers)
    return {
      total_medicines: 0,
      total_active_ingredients: 0,
      total_pharmacists: 0,
      total_companies: 0,
      recent_medicines: [],
    };
  }
}
