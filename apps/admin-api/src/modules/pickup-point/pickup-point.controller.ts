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
import { PickupPointService } from './pickup-point.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import {
  ACTIONS,
  RESOURCES,
  PaginationDto,
  ResponseMessage,
  InjectIdInterceptor,
} from '@libs/index';

@Controller('pickup-points')
@UseInterceptors(ClassSerializerInterceptor)
export class PickupPointController {
  constructor(private readonly pickupPointService: PickupPointService) {}

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Pick up point created successfully')
  create(@Body() createDto: CreatePickupPointDto) {
    return this.pickupPointService.create(createDto);
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.LIST_VIEW)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.pickupPointService.findAll({ pagination });
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pickupPointService.findOne(id);
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.UPDATE)
  @Patch(':id')
  @UseInterceptors(InjectIdInterceptor)
  @ResponseMessage('Pick up point updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePickupPointDto,
  ) {
    return this.pickupPointService.update(id, updateDto);
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Pick up point deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pickupPointService.remove(id);
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Pick up point permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.pickupPointService.removeHard(id);
  }

  @Permissions(RESOURCES.PICKUP_POINT, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Pick up point restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.pickupPointService.restore(id);
  }
}
