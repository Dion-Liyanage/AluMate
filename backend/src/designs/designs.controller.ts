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
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DesignsService } from './designs.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('designs')
export class DesignsController {
  constructor(
    private readonly designsService: DesignsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 5 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      },
    ),
  )
  async create(
    @Body() createDesignDto: CreateDesignDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; model?: Express.Multer.File[] },
  ) {
    let imageUrls: string[] = [];
    let modelUrl: string | undefined = undefined;

    if (files.images && files.images.length > 0) {
      const uploadPromises = files.images.map((file) =>
        this.cloudinaryService.uploadFile(file, 'alumate/designs/images'),
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    if (files.model && files.model.length > 0) {
      const modelFile = files.model[0];
      const uploadResult = await this.cloudinaryService.uploadFile(
        modelFile,
        'alumate/designs/models',
        'raw',
      );
      modelUrl = uploadResult.secure_url;
    }

    return this.designsService.create({
      ...createDesignDto,
      imageUrls,
      modelUrl,
    });
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
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 5 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; model?: Express.Multer.File[] },
  ) {
    let imageUrls = undefined;
    let modelUrl = undefined;

    if (files.images && files.images.length > 0) {
      const uploadPromises = files.images.map((file) =>
        this.cloudinaryService.uploadFile(file, 'alumate/designs/images'),
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    if (files.model && files.model.length > 0) {
      const modelFile = files.model[0];
      const uploadResult = await this.cloudinaryService.uploadFile(
        modelFile,
        'alumate/designs/models',
        'raw',
      );
      modelUrl = uploadResult.secure_url;
    }

    const updateData = {
      ...updateDesignDto,
      ...(imageUrls && { imageUrls }),
      ...(modelUrl && { modelUrl }),
    };

    return this.designsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.designsService.remove(id);
  }
}
