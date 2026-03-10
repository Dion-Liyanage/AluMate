import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create the user
    // Role defaults to 'customer' in the schema
    const newUser = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashedPassword,
      phone: registerDto.phone,
    });

    return {
      success: true,
      message: 'Registration successful',
    };
  }

  async login(loginDto: LoginDto) {
    // We need to bypass the default minus-password select for login
    // So we use the private model in usersService, or simply check password here
    // Let's modify usersService or use a different approach since findByEmail removes password
    
    // Instead of directly using findByEmail (which drops password), we'll do a custom query
    // This is a bit of a hack around the usersService.findByEmail, so we'll just inject the logic
    const user = await (this.usersService as any).userModel
      .findOne({ email: loginDto.email.toLowerCase() })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Generate JWT token
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Remove password from returned user object
    const userObj = user.toObject();
    delete userObj.password;

    return {
      success: true,
      data: {
        token,
        user: {
          id: userObj._id,
          email: userObj.email,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          role: userObj.role,
        },
      },
      message: 'Login successful',
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
