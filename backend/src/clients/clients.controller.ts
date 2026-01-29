import {
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Controller,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';





@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createClientDto: CreateClientDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.clientsService.create(createClientDto, file);
  }


  @Get()
  async findAll() {
    return this.clientsService.findAll();
  }


}
