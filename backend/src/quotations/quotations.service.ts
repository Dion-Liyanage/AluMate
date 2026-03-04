import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quotation, QuotationDocument } from './schemas/quotation.schema';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectModel(Quotation.name)
    private quotationModel: Model<QuotationDocument>,
  ) {}

  async findAll(
    filter: Record<string, any> = {},
  ): Promise<QuotationDocument[]> {
    return this.quotationModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<QuotationDocument | null> {
    return this.quotationModel.findById(id).exec();
  }

  async findByCustomerId(customerId: string): Promise<QuotationDocument[]> {
    return this.quotationModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(quotationData: Partial<Quotation>): Promise<QuotationDocument> {
    const newQuotation = new this.quotationModel(quotationData);
    return newQuotation.save();
  }

  async update(
    id: string,
    updateData: Partial<Quotation>,
  ): Promise<QuotationDocument | null> {
    return this.quotationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<QuotationDocument | null> {
    return this.quotationModel.findByIdAndDelete(id).exec();
  }
}
