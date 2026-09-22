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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto, ResponseMessage } from '@libs/index';

@Controller('addresses')
@UseInterceptors(ClassSerializerInterceptor)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ResponseMessage('تم إضافة العنوان بنجاح')
  create(
    @CurrentUser('id') clientId: number,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(clientId, createAddressDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') clientId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.addressService.findAllClientAddresses(clientId, { pagination });
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') clientId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.findClientAddress(id, clientId);
  }

  @Patch(':id')
  @ResponseMessage('تم تعديل العنوان بنجاح')
  update(
    @CurrentUser('id') clientId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(id, clientId, updateAddressDto);
  }

  @Delete(':id')
  @ResponseMessage('تم حذف العنوان بنجاح')
  remove(
    @CurrentUser('id') clientId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.removeAddress(id, clientId);
  }

  @Patch(':id/default')
  @ResponseMessage('تم تعيين العنوان الافتراضي بنجاح')
  setDefault(
    @CurrentUser('id') clientId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.setDefault(id, clientId);
  }
}
