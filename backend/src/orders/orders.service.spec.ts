
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let model: any;
  let mailService: MailService;
  let usersService: UsersService;

  const mockOrder = {
    _id: 'ord123',
    orderId: 'ALU-ORD-2026-1234',
    customerId: 'user123',
    productType: 'Window',
    status: 'Pending',
    save: jest.fn().mockResolvedValue({ _id: 'ord123', orderId: 'ALU-ORD-2026-1234', productType: 'Window' }),
  };

  const mockOrderModel = jest.fn().mockImplementation(() => mockOrder);
  (mockOrderModel as any).find = jest.fn().mockReturnThis();
  (mockOrderModel as any).sort = jest.fn().mockReturnThis();
  (mockOrderModel as any).skip = jest.fn().mockReturnThis();
  (mockOrderModel as any).limit = jest.fn().mockReturnThis();
  (mockOrderModel as any).populate = jest.fn().mockReturnThis();
  (mockOrderModel as any).exec = jest.fn();
  (mockOrderModel as any).findById = jest.fn().mockReturnThis();
  (mockOrderModel as any).findByIdAndUpdate = jest.fn().mockReturnThis();

  const mockMailService = {
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  };

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue({ email: 'customer@example.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        { provide: MailService, useValue: mockMailService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    model = module.get(getModelToken(Order.name));
    mailService = module.get<MailService>(MailService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and send confirmation email', async () => {
      const orderData = { customerId: 'user123', productType: 'Window' };
      const result = await service.create(orderData as any);

      expect(result.orderId).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(usersService.findById).toHaveBeenCalled();
      expect(mailService.sendOrderConfirmation).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of orders', async () => {
      model.exec.mockResolvedValue([mockOrder]);
      const result = await service.findAll();

      expect(result).toEqual([mockOrder]);
      expect(model.find).toHaveBeenCalled();
    });
  });
});
