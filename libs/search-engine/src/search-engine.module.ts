import { Global, Module } from '@nestjs/common';
import { SearchEngineService } from './search-engine.service';

@Global()
@Module({
  providers: [SearchEngineService],
  exports: [SearchEngineService],
})
export class SearchEngineModule {}
