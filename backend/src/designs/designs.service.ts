import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Design, DesignDocument } from './schemas/design.schema';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(Design.name) private designModel: Model<DesignDocument>,
  ) {}

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
    const updatedDesign = await this.designModel
      .findByIdAndUpdate(id, updateDesignDto, { new: true })
      .exec();
    if (!updatedDesign) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return updatedDesign;
  }

  async remove(id: string): Promise<void> {
    const result = await this.designModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
  }
}
