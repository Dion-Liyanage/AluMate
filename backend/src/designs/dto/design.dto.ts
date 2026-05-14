import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUrl, IsBoolean } from 'class-validator';

export class CreateDesignDto {
  @IsString()
  @IsOptional()
  designCode?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['doors', 'windows', 'cupboards', 'pantries', 'ceilings'])
  @IsNotEmpty()
  category: string;

  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsUrl()
  @IsOptional()
  modelUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDesignDto {
  @IsString()
  @IsOptional()
  designCode?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['doors', 'windows', 'cupboards', 'pantries', 'ceilings'])
  @IsOptional()
  category?: string;

  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsUrl()
  @IsOptional()
  modelUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
