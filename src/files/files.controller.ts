import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/file-fiter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get("/products/:imageName")
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticProducImage(imageName);
    res.sendFile(path);
  }

  @Post("/products")
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: {}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const secureUrl = `${this.configService.get("HOST_API")}/files/products/${file.filename}`;

    return {
      secureUrl
    }
  }


}
