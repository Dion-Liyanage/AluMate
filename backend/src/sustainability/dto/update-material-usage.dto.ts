import { Transform, Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/** Every field optional — only the ones sent are changed. */
export class UpdateMaterialUsageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  projectName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasedKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  usedKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reusableOffcutsKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  scrapWasteKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
