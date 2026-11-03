import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      },
    };
  }

  @Patch()
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // If email is changing, verify it is not already taken by another user
    if (updateProfileDto.email && updateProfileDto.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await this.usersService.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.usersService.update(userId, updateProfileDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role,
        },
      },
      message: 'Profile updated successfully',
    };
  }

  @Patch('password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    
    // We must retrieve the user with the password field included
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, salt);

    // Save the new password
    await this.usersService.update(userId, { password: hashedPassword });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
