import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InventoryAdjustmentsApplicationService } from './InventoryAdjustmentsApplication.service';
import { IInventoryAdjustmentsFilter } from './types/InventoryAdjustments.types';
import { InventoryAdjustment } from './models/InventoryAdjustment';
import { IPaginationMeta } from '@/interfaces/Model';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateQuickInventoryAdjustmentDto } from './dtos/CreateQuickInventoryAdjustment.dto';

@Controller('inventory-adjustments')
@ApiTags('inventory-adjustments')
export class InventoryAdjustmentsController {
  constructor(
    private readonly inventoryAdjustmentsApplicationService: InventoryAdjustmentsApplicationService,
  ) {}

  @Post('quick')
  @ApiOperation({ summary: 'Create a quick inventory adjustment.' })
  @ApiResponse({
    status: 200,
    description: 'The inventory adjustment has been successfully created.',
  })
  public async createQuickInventoryAdjustment(
    @Body() quickAdjustmentDTO: CreateQuickInventoryAdjustmentDto,
  ): Promise<InventoryAdjustment> {
    return this.inventoryAdjustmentsApplicationService.createQuickInventoryAdjustment(
      quickAdjustmentDTO,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete the given inventory adjustment.' })
  @ApiResponse({
    status: 200,
    description: 'The inventory adjustment has been successfully deleted.',
  })
  public async deleteInventoryAdjustment(
    @Param('id') inventoryAdjustmentId: number,
  ): Promise<void> {
    return this.inventoryAdjustmentsApplicationService.deleteInventoryAdjustment(
      inventoryAdjustmentId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieves the inventory adjustments.' })
  @ApiResponse({
    status: 200,
    description: 'The inventory adjustments have been successfully retrieved.',
  })
  public async getInventoryAdjustments(
    @Query() filterDTO: IInventoryAdjustmentsFilter,
  ) {
    return this.inventoryAdjustmentsApplicationService.getInventoryAdjustments(
      filterDTO,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieves the inventory adjustment details.' })
  @ApiResponse({
    status: 200,
    description:
      'The inventory adjustment details have been successfully retrieved.',
  })
  public async getInventoryAdjustment(
    @Param('id') inventoryAdjustmentId: number,
  ): Promise<InventoryAdjustment> {
    return this.inventoryAdjustmentsApplicationService.getInventoryAdjustment(
      inventoryAdjustmentId,
    );
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish the given inventory adjustment.' })
  @ApiResponse({
    status: 200,
    description: 'The inventory adjustment has been successfully published.',
  })
  public async publishInventoryAdjustment(
    @Param('id') inventoryAdjustmentId: number,
  ): Promise<void> {
    return this.inventoryAdjustmentsApplicationService.publishInventoryAdjustment(
      inventoryAdjustmentId,
    );
  }
}
