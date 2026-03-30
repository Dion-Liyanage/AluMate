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
import {
  ServiceAvailability,
  ServiceAvailabilityDocument,
} from './schemas/service-availability.schema';
import { CreateOnSiteVisitDto } from './dto/create-onsite-visit.dto';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateVisitScheduleDto } from './dto/update-visit-schedule.dto';
import { UpsertServiceAvailabilityDto } from './dto/upsert-service-availability.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequestDocument>,
    @InjectModel(ServiceAvailability.name)
    private serviceAvailabilityModel: Model<ServiceAvailabilityDocument>,
  ) {}

  private async getBookedSlotsForDate(date: string): Promise<string[]> {
    const booked = await this.serviceRequestModel
      .find({
        serviceType: 'on-site-visit',
        date,
        status: { $in: ['Request Sent', 'Pending', 'Approved', 'In Progress'] },
      })
      .select('timeSlot')
      .exec();

    return Array.from(new Set(booked.map((item) => item.timeSlot).filter(Boolean)));
  }

  async getConfiguredAvailabilityByDate(date: string): Promise<string[]> {
    if (!date) {
      throw new BadRequestException('Date query parameter is required');
    }

    const record = await this.serviceAvailabilityModel.findOne({ date }).exec();
    return record?.slots || [];
  }

  async getAvailabilityByDate(date: string): Promise<string[]> {
    const configuredSlots = await this.getConfiguredAvailabilityByDate(date);
    const bookedSlots = await this.getBookedSlotsForDate(date);
    return configuredSlots.filter((slot) => !bookedSlots.includes(slot));
  }

  async getAvailabilityDates(): Promise<string[]> {
    const today = new Date().toISOString().split('T')[0];
    const records = await this.serviceAvailabilityModel.find().sort({ date: 1 }).exec();

    const dates: string[] = [];
    for (const record of records) {
      if (record.date < today) {
        continue;
      }

      const slots = await this.getAvailabilityByDate(record.date);
      if (slots.length > 0) {
        dates.push(record.date);
      }
    }

    return dates;
  }

  async getAllAvailability(): Promise<ServiceAvailabilityDocument[]> {
    return this.serviceAvailabilityModel.find().sort({ date: 1 }).exec();
  }

  async upsertAvailability(
    dto: UpsertServiceAvailabilityDto,
  ): Promise<ServiceAvailabilityDocument> {
    const cleanedSlots = Array.from(
      new Set(dto.slots.map((slot) => slot.trim()).filter(Boolean)),
    );

    if (cleanedSlots.length === 0) {
      throw new BadRequestException('At least one valid time slot is required');
    }

    const updated = await this.serviceAvailabilityModel
      .findOneAndUpdate(
        { date: dto.date },
        { date: dto.date, slots: cleanedSlots },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    if (!updated) {
      throw new BadRequestException('Failed to save availability');
    }
    return updated;
  }

  async deleteAvailability(date: string): Promise<void> {
    if (!date) {
      throw new BadRequestException('Date parameter is required');
    }

    await this.serviceAvailabilityModel.findOneAndDelete({ date }).exec();
  }

  // ── Customer: Create On-Site Visit ──
  async createOnSiteVisit(
    userId: string,
    userName: string,
    dto: CreateOnSiteVisitDto,
  ): Promise<ServiceRequestDocument> {
    const availableSlots = await this.getAvailabilityByDate(dto.date);
    if (!availableSlots.includes(dto.timeSlot)) {
      throw new BadRequestException(
        'Selected time slot is not available for this date',
      );
    }

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
    const existing = await this.serviceRequestModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Service request ${id} not found`);
    }

    if (
      existing.status === 'Cancelled by Customer' &&
      dto.status !== 'Cancelled by Customer'
    ) {
      throw new BadRequestException(
        'Cancelled requests cannot be updated by admin',
      );
    }

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

  // Admin updates date/time slot for on-site visit requests.
  async updateVisitSchedule(
    id: string,
    dto: UpdateVisitScheduleDto,
  ): Promise<ServiceRequestDocument> {
    const configuredSlots = await this.getConfiguredAvailabilityByDate(dto.date);
    if (!configuredSlots.includes(dto.timeSlot)) {
      throw new BadRequestException(
        'Selected time slot is not configured for this date',
      );
    }

    const existing = await this.serviceRequestModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Service request ${id} not found`);
    }

    if (existing.serviceType !== 'on-site-visit') {
      throw new BadRequestException(
        'Only on-site visit requests can be rescheduled',
      );
    }

    if (existing.status === 'Cancelled by Customer') {
      throw new BadRequestException('Cancelled requests cannot be rescheduled');
    }

    const conflictingRequest = await this.serviceRequestModel
      .findOne({
        _id: { $ne: existing._id },
        serviceType: 'on-site-visit',
        date: dto.date,
        timeSlot: dto.timeSlot,
        status: { $in: ['Request Sent', 'Pending', 'Approved', 'In Progress'] },
      })
      .exec();

    if (conflictingRequest) {
      throw new BadRequestException(
        'The selected date and time slot is already assigned to another visit',
      );
    }

    existing.date = dto.date;
    existing.timeSlot = dto.timeSlot;
    if (dto.adminNotes !== undefined) {
      existing.adminNotes = dto.adminNotes;
    }

    return existing.save();
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
