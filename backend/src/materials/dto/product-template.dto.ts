import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CUT_ANGLES, SYSTEM_TYPES, TEMPLATE_PRODUCT_TYPES } from '../schemas/product-template.schema';

/** Empty strings / nulls from form inputs mean "no limit". */
const optionalNumber = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : Number(value);

export class BomLineDto {
  @IsString()
  @IsNotEmpty()
  component: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  profileCode: string;

  @IsString()
  @IsNotEmpty()
  quantityFormula: string;

  @IsString()
  @IsNotEmpty()
  lengthFormula: string;

  @Type(() => Number)
  @IsIn(CUT_ANGLES)
  cutAngle: number;
}

export class SizeBandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxWidthFt?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxHeightFt?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxAreaSqFt?: number;

  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  maxPanelWidthFt?: number;

  /** All-inclusive price per sq.ft; empty means itemised pricing. */
  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber()
  @Min(0)
  pricePerSqFt?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  laborRatePerSqFt: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  glassRatePerSqFt: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hardwareCostPerPanel: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomLineDto)
  lines: BomLineDto[];
}

export class CreateProductTemplateDto {
  @IsIn(TEMPLATE_PRODUCT_TYPES)
  productType: string;

  @IsIn(SYSTEM_TYPES)
  systemType: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  minPanels: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxPanels: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  defaultPanels: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SizeBandDto)
  sizeBands: SizeBandDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  minPanels?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxPanels?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  defaultPanels?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SizeBandDto)
  sizeBands?: SizeBandDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
