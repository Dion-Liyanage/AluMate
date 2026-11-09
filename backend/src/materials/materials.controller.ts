import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MaterialsService } from './materials.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { CreateProductTemplateDto, UpdateProductTemplateDto } from './dto/product-template.dto';
import { EstimateDto, PreviewTemplateDto } from './dto/estimate.dto';

/** Customer-facing: opening systems and live material estimates. */
@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('systems')
  async getSystems(@Query('productType') productType?: string) {
    return { success: true, data: await this.materialsService.findSystems(productType) };
  }

  @Post('estimate')
  async estimate(@Body() dto: EstimateDto) {
    const { productType, systemType, ...input } = dto;
    return { success: true, data: await this.materialsService.estimate(productType, systemType, input) };
  }
}

/** Admin: manage the profile catalogue and product templates. */
@Controller('admin/materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminMaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('profiles')
  async getProfiles() {
    return { success: true, data: await this.materialsService.findProfiles() };
  }

  @Post('profiles')
  async createProfile(@Body() dto: CreateProfileDto) {
    return { success: true, data: await this.materialsService.createProfile(dto) };
  }

  @Patch('profiles/:id')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return { success: true, data: await this.materialsService.updateProfile(id, dto) };
  }

  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    return { success: true, data: await this.materialsService.deleteProfile(id) };
  }

  @Get('templates')
  async getTemplates() {
    return { success: true, data: await this.materialsService.findTemplates() };
  }

  @Post('templates/preview')
  async previewTemplate(@Body() dto: PreviewTemplateDto) {
    return { success: true, data: await this.materialsService.preview(dto.template, dto.input) };
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return { success: true, data: await this.materialsService.findTemplate(id) };
  }

  @Post('templates')
  async createTemplate(@Body() dto: CreateProductTemplateDto) {
    return { success: true, data: await this.materialsService.createTemplate(dto) };
  }

  @Patch('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateProductTemplateDto) {
    return { success: true, data: await this.materialsService.updateTemplate(id, dto) };
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return { success: true, data: await this.materialsService.deleteTemplate(id) };
  }
}
