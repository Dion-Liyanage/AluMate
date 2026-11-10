import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavedDesignsService } from './saved-designs.service';
import {
  ImportSavedDesignsDto,
  UpsertSavedDesignDto,
} from './dto/saved-design.dto';

@Controller('saved-designs')
@UseGuards(JwtAuthGuard)
export class SavedDesignsController {
  constructor(private readonly savedDesignsService: SavedDesignsService) {}

  @Get()
  async findAll(@Request() req) {
    const data = await this.savedDesignsService.findAllForUser(req.user.id);
    return { success: true, data };
  }

  // Declared before ':id' routes so "import" isn't treated as an id.
  @Post('import')
  async import(@Request() req, @Body() dto: ImportSavedDesignsDto) {
    const data = await this.savedDesignsService.importMany(req.user.id, dto.designs);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const data = await this.savedDesignsService.findOne(req.user.id, id);
    return { success: true, data };
  }

  @Put(':id')
  async upsert(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpsertSavedDesignDto,
  ) {
    const data = await this.savedDesignsService.upsert(req.user.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.savedDesignsService.remove(req.user.id, id);
    return { success: true, message: 'Saved design deleted' };
  }
}
