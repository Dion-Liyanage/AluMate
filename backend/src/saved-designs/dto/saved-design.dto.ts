import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpsertSavedDesignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  productType: string;

  @IsString()
  @IsNotEmpty()
  designJson: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class ImportSavedDesignDto extends UpsertSavedDesignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id: string;

  @IsOptional()
  @IsISO8601()
  createdAt?: string;

  @IsOptional()
  @IsISO8601()
  updatedAt?: string;
}

export class ImportSavedDesignsDto {
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ImportSavedDesignDto)
  designs: ImportSavedDesignDto[];
}
