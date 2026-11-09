import { Transform, Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMaterialUsageDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  projectName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasedKg: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  usedKg: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reusableOffcutsKg: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  scrapWasteKg: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
