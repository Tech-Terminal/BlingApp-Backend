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
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ACTIONS, RESOURCES, PaginationDto, ResponseMessage } from '@libs/index';

@Controller('areas')
@UseInterceptors(ClassSerializerInterceptor)
export class AreaController {
  constructor(private readonly areaService: AreaService) { }

  @Permissions(RESOURCES.AREA, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Area created successfully')
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Permissions(RESOURCES.AREA, ACTIONS.LIST_VIEW)
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('governorateId', new ParseIntPipe({ optional: true }))
    governorateId?: number,
  ) {
    return this.areaService.findAll({ pagination, governorateId });
  }

  @Permissions(RESOURCES.AREA, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.findOne(id);
  }

  @Permissions(RESOURCES.AREA, ACTIONS.UPDATE)
  @Patch(':id')
  @ResponseMessage('Area updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto,
  ) {
    return this.areaService.update(id, updateAreaDto);
  }

  @Permissions(RESOURCES.AREA, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Area deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.remove(id);
  }

  @Permissions(RESOURCES.AREA, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Area permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.removeHard(id);
  }

  @Permissions(RESOURCES.AREA, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Area restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.restore(id);
  }
}
