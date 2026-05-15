
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QuotationsService } from './quotations.service';
import { Quotation } from './schemas/quotation.schema';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let model: any;

  const mockQuotation = {
    _id: 'quot123',
    customerId: 'user123',
    totalAmount: 5000,
    status: 'sent',
    save: jest.fn().mockResolvedValue({ _id: 'quot123', status: 'sent', totalAmount: 5000 }),
  };

  const mockQuotationModel = jest.fn().mockImplementation(() => mockQuotation);
  (mockQuotationModel as any).find = jest.fn().mockReturnThis();
  (mockQuotationModel as any).sort = jest.fn().mockReturnThis();
  (mockQuotationModel as any).exec = jest.fn();
  (mockQuotationModel as any).findById = jest.fn().mockReturnThis();
  (mockQuotationModel as any).findByIdAndUpdate = jest.fn().mockReturnThis();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        {
          provide: getModelToken(Quotation.name),
          useValue: mockQuotationModel,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
    model = module.get(getModelToken(Quotation.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quotation', async () => {
      const data = { customerId: 'user123', totalAmount: 5000 };
      const result = await service.create(data as any);

      expect(result.totalAmount).toBe(5000);
      expect(mockQuotation.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all quotations', async () => {
      model.exec.mockResolvedValue([mockQuotation]);
      const result = await service.findAll();

      expect(result).toEqual([mockQuotation]);
      expect(model.find).toHaveBeenCalled();
    });
  });
});
