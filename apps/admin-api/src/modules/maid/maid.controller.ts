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
import { MaidService } from './maid.service';
import { CreateMaidDto } from './dto/create-maid.dto';
import { UpdateMaidDto } from './dto/update-maid.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ACTIONS, RESOURCES, PaginationDto, ResponseMessage, InjectIdInterceptor } from '@libs/index';

@Controller('maids')
@UseInterceptors(ClassSerializerInterceptor)
export class MaidController {
  constructor(private readonly maidService: MaidService) {}

  @Permissions(RESOURCES.MAID, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Maid created successfully')
  create(@Body() createMaidDto: CreateMaidDto) {
    return this.maidService.create(createMaidDto);
  }

  @Permissions(RESOURCES.MAID, ACTIONS.LIST_VIEW)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.maidService.findAll({ pagination });
  }

  @Permissions(RESOURCES.MAID, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.maidService.findOne(id);
  }

  @Permissions(RESOURCES.MAID, ACTIONS.UPDATE)
  @Patch(':id')
  @UseInterceptors(InjectIdInterceptor)
  @ResponseMessage('Maid updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaidDto: UpdateMaidDto,
  ) {
    return this.maidService.update(id, updateMaidDto);
  }

  @Permissions(RESOURCES.MAID, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Maid deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.maidService.remove(id);
  }

  @Permissions(RESOURCES.MAID, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Maid permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.maidService.removeHard(id);
  }

  @Permissions(RESOURCES.MAID, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Maid restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.maidService.restore(id);
  }
}
