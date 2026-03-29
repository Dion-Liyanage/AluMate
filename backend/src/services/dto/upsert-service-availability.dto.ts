import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpsertServiceAvailabilityDto {
  @IsString()
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one slot is required' })
  @IsString({ each: true })
  slots: string[];
}
