import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedDesign } from './schemas/saved-design.schema';
import {
  ImportSavedDesignDto,
  UpsertSavedDesignDto,
} from './dto/saved-design.dto';

export interface SavedDesignView {
  id: string;
  name: string;
  productType: string;
  designJson?: string;
  previewImage: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class SavedDesignsService {
  constructor(
    @InjectModel(SavedDesign.name)
    private readonly savedDesignModel: Model<SavedDesign>,
  ) {}

  private toView(doc: any): SavedDesignView {
    return {
      id: doc.designId,
      name: doc.name,
      productType: doc.productType,
      ...(doc.designJson !== undefined ? { designJson: doc.designJson } : {}),
      previewImage: doc.previewImage ?? '',
      description: doc.description,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
    };
  }

  /** List without the (large) canvas JSON. */
  async findAllForUser(userId: string): Promise<SavedDesignView[]> {
    const docs = await this.savedDesignModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('-designJson')
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map((d) => this.toView(d));
  }

  async findOne(userId: string, designId: string): Promise<SavedDesignView> {
    const doc = await this.savedDesignModel
      .findOne({ userId: new Types.ObjectId(userId), designId })
      .lean();
    if (!doc) throw new NotFoundException('Saved design not found');
    return this.toView(doc);
  }

  async upsert(
    userId: string,
    designId: string,
    dto: UpsertSavedDesignDto,
  ): Promise<SavedDesignView> {
    const now = new Date();
    const doc = await this.savedDesignModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), designId },
        {
          $set: {
            name: dto.name,
            productType: dto.productType,
            designJson: dto.designJson,
            previewImage: dto.previewImage ?? '',
            description: dto.description,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, new: true },
      )
      .lean();
    return this.toView(doc);
  }

  /**
   * One-time import from the browser's old localStorage. Only inserts designs
   * the account doesn't have yet, so running it twice never overwrites edits.
   */
  async importMany(
    userId: string,
    designs: ImportSavedDesignDto[],
  ): Promise<{ imported: number }> {
    if (designs.length === 0) return { imported: 0 };
    const owner = new Types.ObjectId(userId);
    const result = await this.savedDesignModel.bulkWrite(
      designs.map((d) => {
        const createdAt = d.createdAt ? new Date(d.createdAt) : new Date();
        const updatedAt = d.updatedAt ? new Date(d.updatedAt) : createdAt;
        return {
          updateOne: {
            filter: { userId: owner, designId: d.id },
            update: {
              $setOnInsert: {
                userId: owner,
                designId: d.id,
                name: d.name,
                productType: d.productType,
                designJson: d.designJson,
                previewImage: d.previewImage ?? '',
                description: d.description,
                createdAt,
                updatedAt,
              },
            },
            upsert: true,
          },
        };
      }),
    );
    return { imported: result.upsertedCount };
  }

  async remove(userId: string, designId: string): Promise<void> {
    const res = await this.savedDesignModel.deleteOne({
      userId: new Types.ObjectId(userId),
      designId,
    });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Saved design not found');
    }
  }
}
