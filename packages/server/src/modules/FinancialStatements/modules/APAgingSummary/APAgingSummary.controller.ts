import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { APAgingSummaryApplication } from './APAgingSummaryApplication';
import { IAPAgingSummaryQuery } from './APAgingSummary.types';
import { AcceptType } from '@/constants/accept-type';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('reports/payable-aging-summary')
@ApiTags('reports')
export class APAgingSummaryController {
  constructor(private readonly APAgingSummaryApp: APAgingSummaryApplication) {}

  @Get()
  @ApiOperation({ summary: 'Get payable aging summary' })
  public async get(
    @Query() filter: IAPAgingSummaryQuery,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept') acceptHeader: string,
  ) {
    // Retrieves the json table format.
    if (acceptHeader.includes(AcceptType.ApplicationJsonTable)) {
      return this.APAgingSummaryApp.table(filter);

      // Retrieves the csv format.
    } else if (acceptHeader.includes(AcceptType.ApplicationCsv)) {
      const csv = await this.APAgingSummaryApp.csv(filter);

      res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
      res.setHeader('Content-Type', 'text/csv');

      res.send(csv);
      // Retrieves the xlsx format.
    } else if (acceptHeader.includes(AcceptType.ApplicationXlsx)) {
      const buffer = await this.APAgingSummaryApp.xlsx(filter);

      res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.send(buffer);
      // Retrieves the pdf format.
    } else if (acceptHeader.includes(AcceptType.ApplicationPdf)) {
      const pdfContent = await this.APAgingSummaryApp.pdf(filter);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfContent.length,
      });
      res.send(pdfContent);
      // Retrieves the json format.
    } else {
      return this.APAgingSummaryApp.sheet(filter);
    }
  }
}
