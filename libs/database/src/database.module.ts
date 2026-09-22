import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfig } from "../../config/app.config";

@Global()
@Module({
  imports: [
      TypeOrmModule.forRoot(AppConfig.typeOrmOptions),
  ]
})
export class DatabaseModule {}
