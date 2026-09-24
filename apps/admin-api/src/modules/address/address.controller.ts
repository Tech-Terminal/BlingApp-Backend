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
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ACTIONS, RESOURCES, PaginationDto, ResponseMessage } from '@libs/index';

@Controller('addresses')
@UseInterceptors(ClassSerializerInterceptor)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Permissions(RESOURCES.ADDRESS, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Address created successfully')
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.createAddress(createAddressDto);
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.LIST_VIEW)
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId?: number,
    @Query('governorateId', new ParseIntPipe({ optional: true })) governorateId?: number,
  ) {
    return this.addressService.findAll({ pagination, clientId, governorateId });
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.findOne(id);
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.UPDATE)
  @Patch(':id')
  @ResponseMessage('Address updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(id, updateAddressDto);
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Address deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.remove(id);
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Address permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.removeHard(id);
  }

  @Permissions(RESOURCES.ADDRESS, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Address restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.restore(id);
  }
}
