import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMaterialUsageDto } from './dto/create-material-usage.dto';
import { CompleteFabricationDto } from './dto/complete-fabrication.dto';
import {
  MaterialUsage,
  MaterialUsageDocument,
  PlannedMaterialUsage,
} from './schemas/material-usage.schema';

/** Actual waste this many percentage points above plan is flagged for review. */
const HIGH_WASTE_MARGIN_PCT = 3;

const rate = (part: number, whole: number) => (whole > 0 ? Number(((part / whole) * 100).toFixed(1)) : 0);

@Injectable()
export class SustainabilityService {
  constructor(
    @InjectModel(MaterialUsage.name)
    private readonly materialUsageModel: Model<MaterialUsageDocument>,
  ) {}

  async createMaterialUsage(data: CreateMaterialUsageDto, adminId: string) {
    this.validateMaterialAllocation(data);
    const costPerKg = this.calculateCostPerKg(data.purchasedKg, data.totalCost);

    return this.materialUsageModel.create({
      ...data,
      costPerKg,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      recordedBy: new Types.ObjectId(adminId),
    });
  }

  async createForOrder(
    data: CompleteFabricationDto,
    adminId: string,
    orderId: string,
    orderNumber: string,
    projectName: string,
    planned?: PlannedMaterialUsage,
  ) {
    this.validateMaterialAllocation(data);
    const costPerKg = this.calculateCostPerKg(data.purchasedKg, data.totalCost);

    const existingRecord = await this.materialUsageModel.exists({ orderId });
    if (existingRecord) {
      throw new ConflictException('Material usage has already been recorded for this order');
    }

    return this.materialUsageModel.create({
      ...data,
      costPerKg,
      orderId: new Types.ObjectId(orderId),
      orderNumber,
      projectName,
      planned,
      recordedAt: new Date(),
      recordedBy: new Types.ObjectId(adminId),
    });
  }

  async getDashboard() {
    const records = await this.materialUsageModel
      .find()
      .sort({ recordedAt: -1 })
      .lean()
      .exec();

    const summary = records.reduce(
      (totals, record) => {
        totals.purchasedKg += record.purchasedKg;
        totals.usedKg += record.usedKg;
        totals.reusableOffcutsKg += record.reusableOffcutsKg;
        totals.scrapWasteKg += record.scrapWasteKg;
        totals.costSaved += record.reusableOffcutsKg * record.costPerKg;
        return totals;
      },
      {
        purchasedKg: 0,
        usedKg: 0,
        reusableOffcutsKg: 0,
        scrapWasteKg: 0,
        costSaved: 0,
      },
    );

    const projects = new Map<
      string,
      { project: string; used: number; reusable: number; scrap: number; purchased: number; latestRecordedAt: Date }
    >();

    for (const record of records) {
      const projectKey = record.orderId?.toString() ?? record.projectName;
      const projectLabel = record.orderNumber
        ? `${record.orderNumber} — ${record.projectName}`
        : record.projectName;
      const current = projects.get(projectKey) ?? {
        project: projectLabel,
        used: 0,
        reusable: 0,
        scrap: 0,
        purchased: 0,
        latestRecordedAt: record.recordedAt,
      };

      current.used += record.usedKg;
      current.reusable += record.reusableOffcutsKg;
      current.scrap += record.scrapWasteKg;
      current.purchased += record.purchasedKg;
      projects.set(projectKey, current);
    }

    const monthlyWaste = this.getMonthlyWaste(records);
    const planComparison = this.getPlanComparison(records);

    return {
      summary: {
        ...summary,
        wasteRate: rate(summary.scrapWasteKg, summary.purchasedKg),
        efficiencyPct: rate(summary.usedKg, summary.purchasedKg),
      },
      ...planComparison,
      materialDistribution: [
        { name: 'Used in projects', value: summary.usedKg, color: '#34d399' },
        { name: 'Reusable offcuts', value: summary.reusableOffcutsKg, color: '#60a5fa' },
        { name: 'Scrap waste', value: summary.scrapWasteKg, color: '#f59e0b' },
      ],
      monthlyWaste,
      projects: Array.from(projects.values())
        .map((project) => ({
          ...project,
          wasteRate: project.purchased
            ? Number(((project.scrap / project.purchased) * 100).toFixed(1))
            : 0,
        }))
        .sort((a, b) => b.latestRecordedAt.getTime() - a.latestRecordedAt.getTime()),
    };
  }

  /** Planned (cutting optimiser) vs actual waste for orders completed with a plan. */
  private getPlanComparison(records: MaterialUsage[]) {
    const planned = records.filter((record) => record.planned && record.planned.purchasedKg > 0);

    const comparisons = planned.map((record) => {
      const plannedWasteRate = rate(record.planned!.scrapWasteKg, record.planned!.purchasedKg);
      const actualWasteRate = rate(record.scrapWasteKg, record.purchasedKg);
      return {
        orderNumber: record.orderNumber ?? record.projectName,
        projectName: record.projectName,
        recordedAt: record.recordedAt,
        plannedScrapKg: record.planned!.scrapWasteKg,
        actualScrapKg: record.scrapWasteKg,
        extraScrapKg: Number((record.scrapWasteKg - record.planned!.scrapWasteKg).toFixed(3)),
        plannedWasteRate,
        actualWasteRate,
        difference: Number((actualWasteRate - plannedWasteRate).toFixed(1)),
      };
    });

    const plannedTotals = planned.reduce(
      (totals, record) => {
        totals.plannedScrapKg += record.planned!.scrapWasteKg;
        totals.plannedPurchasedKg += record.planned!.purchasedKg;
        totals.actualScrapKg += record.scrapWasteKg;
        totals.actualPurchasedKg += record.purchasedKg;
        return totals;
      },
      { plannedScrapKg: 0, plannedPurchasedKg: 0, actualScrapKg: 0, actualPurchasedKg: 0 },
    );

    return {
      planAccuracy: {
        ordersWithPlan: planned.length,
        totalOrders: records.length,
        plannedWasteRate: rate(plannedTotals.plannedScrapKg, plannedTotals.plannedPurchasedKg),
        actualWasteRate: rate(plannedTotals.actualScrapKg, plannedTotals.actualPurchasedKg),
        extraScrapKg: Number((plannedTotals.actualScrapKg - plannedTotals.plannedScrapKg).toFixed(3)),
        highWasteMarginPct: HIGH_WASTE_MARGIN_PCT,
      },
      // records are newest first; chart reads oldest → newest
      plannedVsActual: comparisons.slice(0, 8).reverse(),
      highWasteOrders: comparisons
        .filter((comparison) => comparison.difference > HIGH_WASTE_MARGIN_PCT)
        .sort((a, b) => b.difference - a.difference)
        .slice(0, 10),
    };
  }

  private getMonthlyWaste(
    records: Array<Pick<MaterialUsage, 'recordedAt' | 'purchasedKg' | 'scrapWasteKg'>>,
  ) {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString('en', { month: 'short' }),
        purchasedKg: 0,
        scrapWasteKg: 0,
      };
    });
    const monthMap = new Map(months.map((month) => [month.key, month]));

    for (const record of records) {
      const date = new Date(record.recordedAt);
      const month = monthMap.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) {
        month.purchasedKg += record.purchasedKg;
        month.scrapWasteKg += record.scrapWasteKg;
      }
    }

    return months.map(({ month, purchasedKg, scrapWasteKg }) => ({
      month,
      wasteRate: purchasedKg
        ? Number(((scrapWasteKg / purchasedKg) * 100).toFixed(1))
        : 0,
    }));
  }

  private validateMaterialAllocation(data: CompleteFabricationDto | CreateMaterialUsageDto) {
    const allocatedKg = data.usedKg + data.reusableOffcutsKg + data.scrapWasteKg;

    if (allocatedKg > data.purchasedKg + 0.001) {
      throw new BadRequestException(
        'Used material, reusable offcuts, and scrap cannot exceed the purchased material.',
      );
    }

    if (data.purchasedKg === 0 && data.totalCost > 0) {
      throw new BadRequestException('Purchased material must be greater than zero when a total cost is entered.');
    }
  }

  private calculateCostPerKg(purchasedKg: number, totalCost: number) {
    return purchasedKg > 0 ? totalCost / purchasedKg : 0;
  }
}
