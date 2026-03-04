import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from './schemas/service-request.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  async findAll(
    filter: Record<string, any> = {},
  ): Promise<ServiceRequestDocument[]> {
    return this.serviceRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ServiceRequestDocument | null> {
    return this.serviceRequestModel.findById(id).exec();
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<ServiceRequestDocument[]> {
    return this.serviceRequestModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(
    serviceData: Partial<ServiceRequest>,
  ): Promise<ServiceRequestDocument> {
    const newService = new this.serviceRequestModel(serviceData);
    return newService.save();
  }

  async update(
    id: string,
    updateData: Partial<ServiceRequest>,
  ): Promise<ServiceRequestDocument | null> {
    return this.serviceRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<ServiceRequestDocument | null> {
    return this.serviceRequestModel.findByIdAndDelete(id).exec();
  }
}
