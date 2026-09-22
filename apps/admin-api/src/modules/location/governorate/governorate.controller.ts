import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { GovernorateService } from './governorate.service';
import { CreateGovernorateDto } from './dto/create-governorate.dto';
import { UpdateGovernorateDto } from './dto/update-governorate.dto';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ACTIONS, RESOURCES, PaginationDto, ResponseMessage } from '@libs/index';

@Controller('governorates')
@UseInterceptors(ClassSerializerInterceptor)
export class GovernorateController {
  constructor(private readonly governorateService: GovernorateService) { }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Governorate created successfully')
  create(@Body() createGovernorateDto: CreateGovernorateDto) {
    return this.governorateService.create(createGovernorateDto);
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.LIST_VIEW)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.governorateService.findAll({ pagination });
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.governorateService.findOne(id);
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.UPDATE)
  @Patch(':id')
  @ResponseMessage('Governorate updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGovernorateDto: UpdateGovernorateDto,
  ) {
    return this.governorateService.update(id, updateGovernorateDto);
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Governorate deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.governorateService.remove(id);
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Governorate permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.governorateService.removeHard(id);
  }

  @Permissions(RESOURCES.GOVERNORATE, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Governorate restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.governorateService.restore(id);
  }
}
