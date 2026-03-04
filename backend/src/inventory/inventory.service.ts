import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryItem,
  InventoryItemDocument,
} from './schemas/inventory-item.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItemDocument>,
  ) {}

  async findAll(
    filter: Record<string, any> = {},
  ): Promise<InventoryItemDocument[]> {
    return this.inventoryModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<InventoryItemDocument | null> {
    return this.inventoryModel.findById(id).exec();
  }

  async findLowStock(): Promise<InventoryItemDocument[]> {
    return this.inventoryModel
      .find({
        $expr: { $lte: ['$quantity', '$reorderLevel'] },
      })
      .exec();
  }

  async create(
    itemData: Partial<InventoryItem>,
  ): Promise<InventoryItemDocument> {
    const newItem = new this.inventoryModel(itemData);
    return newItem.save();
  }

  async update(
    id: string,
    updateData: Partial<InventoryItem>,
  ): Promise<InventoryItemDocument | null> {
    return this.inventoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<InventoryItemDocument | null> {
    return this.inventoryModel.findByIdAndDelete(id).exec();
  }
}
