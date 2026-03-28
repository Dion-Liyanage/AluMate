import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateServiceStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(
    ['Request Sent', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
    { message: 'Invalid status value' },
  )
  status: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
