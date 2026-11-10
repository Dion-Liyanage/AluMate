import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private deleteLocalProjectImages(imageUrls?: string[]) {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const uploadsDir = join(__dirname, '..', '..', 'uploads', 'projects');

    for (const imageUrl of imageUrls) {
      if (!imageUrl || !imageUrl.includes('/uploads/projects/')) {
        continue;
      }

      const filePath = join(uploadsDir, basename(imageUrl));

      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch {
        // Ignore file system cleanup errors
      }
    }
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto);
    return createdProject.save();
  }

  async findAll(category?: string): Promise<Project[]> {
    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }
    return this.projectModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findAllAdmin(category?: string): Promise<Project[]> {
    const query: any = {};
    if (category) {
      query.category = category;
    }
    return this.projectModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const existingProject = await this.projectModel.findById(id).exec();
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const previousImageUrls = existingProject.imageUrls || [];

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (updateProjectDto.imageUrls && updateProjectDto.imageUrls.length > 0) {
      const kept = new Set(updateProjectDto.imageUrls);
      const removedImages = previousImageUrls.filter((url) => !kept.has(url));
      this.deleteLocalProjectImages(removedImages);
      // Fire-and-forget: cleanup failures must not fail the update
      void this.cloudinaryService.deleteByUrls(removedImages);
    }

    return updatedProject;
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.projectModel.findByIdAndDelete(id).exec();
    this.deleteLocalProjectImages(project.imageUrls);
    void this.cloudinaryService.deleteByUrls(project.imageUrls || []);
  }

  async count(): Promise<number> {
    return this.projectModel.countDocuments({ isActive: true }).exec();
  }
}
