import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DesignsService } from './designs.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  private static getUploadDestination() {
    const uploadDir = join(__dirname, '..', '..', 'uploads', 'designs');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, DesignsController.getUploadDestination());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  create(
    @Body() createDesignDto: CreateDesignDto,
    @UploadedFiles() files: any[],
  ) {
    const imageUrls = files?.map(file => `/uploads/designs/${file.filename}`) || [];
    return this.designsService.create({ ...createDesignDto, imageUrls });
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.designsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, DesignsController.getUploadDestination());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    @UploadedFiles() files: any[],
  ) {
    const newImageUrls = files?.map(file => `/uploads/designs/${file.filename}`) || [];
    const updateData = newImageUrls.length > 0 
      ? { ...updateDesignDto, imageUrls: newImageUrls } 
      : updateDesignDto;
    return this.designsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.designsService.remove(id);
  }
}
