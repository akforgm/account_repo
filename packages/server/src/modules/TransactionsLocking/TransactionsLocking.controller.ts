import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Put, Get, Body, Param } from '@nestjs/common';
import { TransactionsLockingService } from './commands/CommandTransactionsLockingService';
import { TransactionsLockingGroup } from './types/TransactionsLocking.types';
import { ITransactionLockingPartiallyDTO } from './types/TransactionsLocking.types';
import { QueryTransactionsLocking } from './queries/QueryTransactionsLocking';
import {
  CancelTransactionsLockingDto,
  TransactionsLockingDto,
} from './dtos/TransactionsLocking.dto';

@Controller('transactions-locking')
@ApiTags('Transactions Locking')
export class TransactionsLockingController {
  constructor(
    private readonly transactionsLockingService: TransactionsLockingService,
    private readonly queryTransactionsLocking: QueryTransactionsLocking,
  ) {}

  @Put('lock')
  @ApiOperation({
    summary: 'Lock all transactions for a module or all modules',
  })
  async commandTransactionsLocking(
    @Body('module') module: TransactionsLockingGroup,
    @Body() transactionLockingDTO: TransactionsLockingDto,
  ) {
    const transactionMeta =
      await this.transactionsLockingService.commandTransactionsLocking(
        module,
        transactionLockingDTO,
      );
    return {
      message: 'All transactions locking has been submit successfully.',
      data: transactionMeta,
    };
  }

  @Put('cancel-lock')
  @ApiOperation({
    summary: 'Cancel all transactions locking for a module or all modules',
  })
  async cancelTransactionLocking(
    @Body('module') module: TransactionsLockingGroup,
    @Body() cancelLockingDTO: CancelTransactionsLockingDto,
  ) {
    const data = await this.transactionsLockingService.cancelTransactionLocking(
      module,
      cancelLockingDTO,
    );
    return {
      message: 'Transactions locking has been canceled successfully.',
      data,
    };
  }

  @Put('unlock-partial')
  @ApiOperation({
    summary:
      'Partial unlock all transactions locking for a module or all modules',
  })
  async unlockTransactionsLockingBetweenPeriod(
    @Body('module') module: TransactionsLockingGroup,
    @Body() unlockDTO: ITransactionLockingPartiallyDTO,
  ) {
    const transactionMeta =
      await this.transactionsLockingService.unlockTransactionsLockingPartially(
        module,
        unlockDTO,
      );
    return {
      message: 'Transactions locking has been unlocked partially successfully.',
      data: transactionMeta,
    };
  }

  @Put('cancel-unlock-partial')
  @ApiOperation({
    summary:
      'Cancel partial unlocking all transactions locking for a module or all modules',
  })
  async cancelPartialUnlocking(
    @Body('module') module: TransactionsLockingGroup,
  ) {
    const transactionMeta =
      await this.transactionsLockingService.cancelPartialTransactionsUnlock(
        module,
      );
    return {
      message: 'Partial transaction unlocking has been canceled successfully.',
      data: transactionMeta,
    };
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all transactions locking meta' })
  async getTransactionLockingMetaList() {
    return await this.queryTransactionsLocking.getTransactionsLockingList();
  }

  @Get(':module')
  @ApiOperation({ summary: 'Get transactions locking meta for a module' })
  async getTransactionLockingMeta(@Param('module') module: string) {
    return await this.queryTransactionsLocking.getTransactionsLockingModuleMeta(
      module as TransactionsLockingGroup,
    );
  }
}
