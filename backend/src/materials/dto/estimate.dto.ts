import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SYSTEM_TYPES, TEMPLATE_PRODUCT_TYPES } from '../schemas/product-template.schema';
import { CreateProductTemplateDto } from './product-template.dto';

/** Design inputs shared by the customer estimate and the admin preview. */
export class BomInputDto {
  /** Values are dimension strings like 5'2" or numbers in feet. */
  @IsObject()
  measurements: Record<string, string | number>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  panels?: number;

  /** Extra vertical bars drawn in the design studio. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  verticalBars?: number;

  /** Extra horizontal bars drawn in the design studio. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  horizontalBars?: number;

  @IsOptional()
  @IsString()
  color?: string;
}

export class EstimateDto extends BomInputDto {
  @IsIn(TEMPLATE_PRODUCT_TYPES)
  productType: string;

  @IsIn(SYSTEM_TYPES)
  systemType: string;
}

/** Admin preview of an unsaved template. */
export class PreviewTemplateDto {
  @ValidateNested()
  @Type(() => CreateProductTemplateDto)
  template: CreateProductTemplateDto;

  @ValidateNested()
  @Type(() => BomInputDto)
  input: BomInputDto;
}
