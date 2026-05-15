
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    isActive: true,
    toObject: jest.fn().mockReturnValue({ _id: 'user123', email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'customer' }),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    userModel: {
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  const mockMailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email is already in use', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      await expect(service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789'
      })).rejects.toThrow(ConflictException);
    });

    it('should create a new user and send welcome email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
      
      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789'
      });

      expect(result.success).toBe(true);
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mailService.sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.userModel.exec.mockResolvedValue(null);

      await expect(service.login({
        email: 'wrong@example.com',
        password: 'password'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockUsersService.userModel.exec.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login({
        email: 'test@example.com',
        password: 'wrongPassword'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on successful login', async () => {
      mockUsersService.userModel.exec.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login({
        email: 'test@example.com',
        password: 'correctPassword'
      });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('mockToken');
      expect(result.data.user.email).toBe(mockUser.email);
    });
  });
});
