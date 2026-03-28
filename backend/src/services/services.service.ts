import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from './schemas/service-request.schema';
import { CreateOnSiteVisitDto } from './dto/create-onsite-visit.dto';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  // ── Customer: Create On-Site Visit ──
  async createOnSiteVisit(
    userId: string,
    userName: string,
    dto: CreateOnSiteVisitDto,
  ): Promise<ServiceRequestDocument> {
    const newRequest = new this.serviceRequestModel({
      customerId: new Types.ObjectId(userId),
      customerName: userName,
      serviceType: 'on-site-visit',
      status: 'Request Sent',
      date: dto.date,
      timeSlot: dto.timeSlot,
      contactNumber: dto.contactNumber,
      nearestTown: dto.nearestTown,
      location: dto.location || null,
      manualAddress: dto.manualAddress || null,
    });
    return newRequest.save();
  }

  // ── Customer: Create Repair Request ──
  async createRepair(
    userId: string,
    userName: string,
    dto: CreateRepairDto,
    imageUrl?: string,
  ): Promise<ServiceRequestDocument> {
    const newRequest = new this.serviceRequestModel({
      customerId: new Types.ObjectId(userId),
      customerName: userName,
      serviceType: 'repair',
      status: 'Request Sent',
      date: new Date().toISOString().split('T')[0], // today's date
      orderId: dto.orderId,
      issueDescription: dto.issueDescription,
      imageUrl: imageUrl || null,
    });
    return newRequest.save();
  }

  // ── Admin: Get all service requests (with optional filters) ──
  async findAll(filters?: {
    serviceType?: string;
    status?: string;
  }): Promise<ServiceRequestDocument[]> {
    const query: Record<string, any> = {};

    if (filters?.serviceType && filters.serviceType !== 'all') {
      query.serviceType = filters.serviceType;
    }
    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    return this.serviceRequestModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  // ── Get single request by ID ──
  async findById(id: string): Promise<ServiceRequestDocument> {
    const request = await this.serviceRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Service request ${id} not found`);
    }
    return request;
  }

  // ── Customer: Get own requests ──
  async findByCustomerId(
    customerId: string,
  ): Promise<ServiceRequestDocument[]> {
    return this.serviceRequestModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ── Admin: Update status ──
  async updateStatus(
    id: string,
    dto: UpdateServiceStatusDto,
  ): Promise<ServiceRequestDocument> {
    const updateData: Record<string, any> = { status: dto.status };
    if (dto.adminNotes !== undefined) {
      updateData.adminNotes = dto.adminNotes;
    }

    const updated = await this.serviceRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Service request ${id} not found`);
    }
    return updated;
  }

  // ── Customer: Cancel own request (soft cancel via status) ──
  async cancelByCustomer(
    requestId: string,
    customerId: string,
  ): Promise<ServiceRequestDocument> {
    const request = await this.serviceRequestModel.findById(requestId).exec();

    if (!request) {
      throw new NotFoundException(`Service request ${requestId} not found`);
    }

    if (request.customerId.toString() !== customerId) {
      throw new ForbiddenException('You can only cancel your own service requests');
    }

    const cancellableStatuses = ['Request Sent', 'Pending', 'Approved'];
    if (!cancellableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Request cannot be cancelled when status is "${request.status}"`,
      );
    }

    request.status = 'Cancelled by Customer';
    return request.save();
  }

  // ── Admin: Delete request ──
  async delete(id: string): Promise<ServiceRequestDocument | null> {
    return this.serviceRequestModel.findByIdAndDelete(id).exec();
  }
}
