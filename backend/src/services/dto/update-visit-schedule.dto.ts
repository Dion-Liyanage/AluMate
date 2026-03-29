import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateVisitScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Time slot is required' })
  timeSlot: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
