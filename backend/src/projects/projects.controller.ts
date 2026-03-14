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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private static getUploadDestination() {
    const uploadDir = join(__dirname, '..', '..', 'uploads', 'projects');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, ProjectsController.getUploadDestination());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files: any[],
  ) {
    const totalSize = files?.reduce((acc, file) => acc + file.size, 0) || 0;
    if (totalSize > 20 * 1024 * 1024) {
      throw new BadRequestException('Total file size exceeds 20MB limit for 5 images');
    }
    const imageUrls = files?.map(file => `/uploads/projects/${file.filename}`) || [];
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, ProjectsController.getUploadDestination());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: any[],
  ) {
    const totalSize = files?.reduce((acc, file) => acc + file.size, 0) || 0;
    if (totalSize > 20 * 1024 * 1024) {
      throw new BadRequestException('Total file size exceeds 20MB limit for 5 images');
    }
    const newImageUrls = files?.map(file => `/uploads/projects/${file.filename}`) || [];
    const updateData = newImageUrls.length > 0
      ? { ...updateProjectDto, imageUrls: newImageUrls }
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
