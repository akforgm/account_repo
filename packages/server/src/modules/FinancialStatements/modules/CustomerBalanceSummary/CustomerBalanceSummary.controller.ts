import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { ICustomerBalanceSummaryQuery } from './CustomerBalanceSummary.types';
import { CustomerBalanceSummaryApplication } from './CustomerBalanceSummaryApplication';
import { AcceptType } from '@/constants/accept-type';

@Controller('/reports/customer-balance-summary')
@ApiTags('reports')
export class CustomerBalanceSummaryController {
  constructor(
    private readonly customerBalanceSummaryApp: CustomerBalanceSummaryApplication,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Customer balance summary report' })
  @ApiOperation({ summary: 'Get customer balance summary report' })
  async customerBalanceSummary(
    @Query() filter: ICustomerBalanceSummaryQuery,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept') acceptHeader: string,
  ) {
    // Retrieves the xlsx format.
    if (acceptHeader.includes(AcceptType.ApplicationXlsx)) {
      const buffer = await this.customerBalanceSummaryApp.xlsx(filter);
      res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.send(buffer);
      // Retrieves the csv format.
    } else if (acceptHeader.includes(AcceptType.ApplicationCsv)) {
      const buffer = await this.customerBalanceSummaryApp.csv(filter);
      res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
      res.setHeader('Content-Type', 'text/csv');

      res.send(buffer);
      // Retrieves the json table format.
    } else if (acceptHeader.includes(AcceptType.ApplicationJsonTable)) {
      return this.customerBalanceSummaryApp.table(filter);

      // Retrieves the pdf format.
    } else if (acceptHeader.includes(AcceptType.ApplicationPdf)) {
      const buffer = await this.customerBalanceSummaryApp.pdf(filter);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length,
      });
      res.send(buffer);
      // Retrieves the json format.
    } else {
      return this.customerBalanceSummaryApp.sheet(filter);
    }
  }
}
