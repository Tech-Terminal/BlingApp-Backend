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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ACTIONS, RESOURCES, PaginationDto, ResponseMessage, InjectIdInterceptor } from '@libs/index';

@Controller('clients')
@UseInterceptors(ClassSerializerInterceptor)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Permissions(RESOURCES.CLIENT, ACTIONS.CREATE)
  @Post()
  @ResponseMessage('Client created successfully')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.LIST_VIEW)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.clientService.findAll({ pagination });
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.DETAILED_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.DETAILED_VIEW)
  @Get(':id/addresses')
  findClientAddresses(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findClientAddresses(id);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.UPDATE)
  @Patch(':id')
  @UseInterceptors(InjectIdInterceptor)
  @ResponseMessage('Client updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.DELETE_SOFT)
  @Delete(':id')
  @ResponseMessage('Client deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.DELETE_HARD)
  @Delete(':id/hard-delete')
  @ResponseMessage('Client permanently deleted')
  removeHard(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.removeHard(id);
  }

  @Permissions(RESOURCES.CLIENT, ACTIONS.RESTORE)
  @Post('restore/:id')
  @ResponseMessage('Client restored successfully')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.restore(id);
  }
}
