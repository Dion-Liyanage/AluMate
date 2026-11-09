import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PROFILE_SHAPES } from '../schemas/profile.schema';

const toCode = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @Transform(toCode)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  series: string;

  @IsIn(PROFILE_SHAPES)
  shape: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thicknessMm: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKgPerM: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  barLengthFt: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerFt: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(toCode)
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  series?: string;

  @IsOptional()
  @IsIn(PROFILE_SHAPES)
  shape?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thicknessMm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKgPerM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  barLengthFt?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerFt?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
