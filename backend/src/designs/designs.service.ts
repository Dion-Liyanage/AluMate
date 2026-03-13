import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { Design, DesignDocument } from './schemas/design.schema';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(Design.name) private designModel: Model<DesignDocument>,
  ) {}

  private deleteLocalDesignImages(imageUrls?: string[]) {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const uploadsDir = join(__dirname, '..', '..', 'uploads', 'designs');

    for (const imageUrl of imageUrls) {
      if (!imageUrl || !imageUrl.includes('/uploads/designs/')) {
        continue;
      }

      const filePath = join(uploadsDir, basename(imageUrl));

      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch {
        // Ignore file system cleanup errors and keep delete operation successful
      }
    }
  }

  async create(createDesignDto: CreateDesignDto): Promise<Design> {
    const createdDesign = new this.designModel(createDesignDto);
    return createdDesign.save();
  }

  async findAll(category?: string): Promise<Design[]> {
    const query = category ? { category } : {};
    return this.designModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designModel.findById(id).exec();
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return design;
  }

  async update(id: string, updateDesignDto: UpdateDesignDto): Promise<Design> {
    const existingDesign = await this.designModel.findById(id).exec();
    if (!existingDesign) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }

    const previousImageUrls = existingDesign.imageUrls || [];

    const updatedDesign = await this.designModel
      .findByIdAndUpdate(id, updateDesignDto, { new: true })
      .exec();
    if (!updatedDesign) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }

    if (updateDesignDto.imageUrls && updateDesignDto.imageUrls.length > 0) {
      this.deleteLocalDesignImages(previousImageUrls);
    }

    return updatedDesign;
  }

  async remove(id: string): Promise<void> {
    const design = await this.designModel.findById(id).exec();
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }

    await this.designModel.findByIdAndDelete(id).exec();
    this.deleteLocalDesignImages(design.imageUrls);
  }
}
