import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quotation, QuotationSchema } from './schemas/quotation.schema';
import { QuotationsService } from './quotations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quotation.name, schema: QuotationSchema },
    ]),
  ],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
