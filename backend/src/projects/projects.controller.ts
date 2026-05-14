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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
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
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      return this.projectsService.create({ ...createProjectDto, imageUrls: [] });
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      throw new BadRequestException('Total file size exceeds 20MB limit');
    }

    const uploadPromises = files.map(file => 
      this.cloudinaryService.uploadFile(file, 'alumate/projects')
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    return this.projectsService.create({ ...createProjectDto, imageUrls });
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.projectsService.findAll(category);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllAdmin(@Query('category') category?: string) {
    return this.projectsService.findAllAdmin(category);
  }

  @Get('count')
  async getCount() {
    const count = await this.projectsService.count();
    return { count };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
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
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrls = undefined;

    if (files && files.length > 0) {
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        throw new BadRequestException('Total file size exceeds 20MB limit');
      }

      const uploadPromises = files.map(file => 
        this.cloudinaryService.uploadFile(file, 'alumate/projects')
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.secure_url);
    }

    const updateData = imageUrls 
      ? { ...updateProjectDto, imageUrls } 
      : updateProjectDto;

    return this.projectsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
