import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class CompleteFabricationDto {
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
}
