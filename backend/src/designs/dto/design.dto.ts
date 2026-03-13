import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUrl, IsBoolean } from 'class-validator';

export class CreateDesignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['doors', 'windows', 'cupboards', 'pantries', 'ceilings'])
  @IsNotEmpty()
  category: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

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
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['doors', 'windows', 'cupboards', 'pantries', 'ceilings'])
  @IsOptional()
  category?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
