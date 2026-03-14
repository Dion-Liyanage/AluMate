import { IsString, IsOptional, IsArray, IsNumber, Min, Max, ValidateNested, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FeedbackDto {
  @IsString()
  name: string;

  @IsString()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  reviewCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackDto)
  feedbacks?: FeedbackDto[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  materialUsed?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  reviewCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackDto)
  feedbacks?: FeedbackDto[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  materialUsed?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
