import { Global, Module } from '@nestjs/common';
import { IsUniqueConstraint } from './validators/is-unique.validator';
import { IsExistConstraint } from './validators/is-exist-validator';

@Global()
@Module({
  providers: [IsUniqueConstraint, IsExistConstraint],
  exports: [IsUniqueConstraint, IsExistConstraint]
})
export class ValidatorsModule {}
