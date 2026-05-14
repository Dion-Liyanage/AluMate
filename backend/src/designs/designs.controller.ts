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
import { FilesInterceptor } from '@nestjs/platform-express';
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
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async create(
    @Body() createDesignDto: CreateDesignDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      return this.designsService.create({ ...createDesignDto, imageUrls: [] });
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      throw new BadRequestException('Total file size exceeds 20MB limit');
    }

    // Upload files to Cloudinary in parallel
    const uploadPromises = files.map(file => 
      this.cloudinaryService.uploadFile(file, 'alumate/designs')
    );
    
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

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
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrls = undefined;

    if (files && files.length > 0) {
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        throw new BadRequestException('Total file size exceeds 20MB limit');
      }

      const uploadPromises = files.map(file => 
        this.cloudinaryService.uploadFile(file, 'alumate/designs')
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.secure_url);
    }

    const updateData = imageUrls 
      ? { ...updateDesignDto, imageUrls } 
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
