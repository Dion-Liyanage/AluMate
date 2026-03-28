import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRepairDto {
  @IsString()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Issue description is required' })
  issueDescription: string;

  // imageUrl is set by the controller after file upload, not sent by the client
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
