import { IARAgingSummaryQuery } from './ARAgingSummary.types';
import { Controller, Get, Headers } from '@nestjs/common';
import { Query, Res } from '@nestjs/common';
import { ARAgingSummaryApplication } from './ARAgingSummaryApplication';
import { AcceptType } from '@/constants/accept-type';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('reports/receivable-aging-summary')
@ApiTags('reports')
export class ARAgingSummaryController {
  constructor(private readonly ARAgingSummaryApp: ARAgingSummaryApplication) {}

  @Get()
  @ApiOperation({ summary: 'Get receivable aging summary' })
  public async get(
    @Query() filter: IARAgingSummaryQuery,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept') acceptHeader: string,
  ) {
    // Retrieves the xlsx format.
    if (acceptHeader.includes(AcceptType.ApplicationXlsx)) {
      const buffer = await this.ARAgingSummaryApp.xlsx(filter);

      res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.send(buffer);
      // Retrieves the table format.
    } else if (acceptHeader.includes(AcceptType.ApplicationJsonTable)) {
      return this.ARAgingSummaryApp.table(filter);

      // Retrieves the csv format.
    } else if (acceptHeader.includes(AcceptType.ApplicationCsv)) {
      const buffer = await this.ARAgingSummaryApp.csv(filter);

      res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
      res.setHeader('Content-Type', 'text/csv');

      res.send(buffer);
      // Retrieves the pdf format.
    } else if (acceptHeader.includes(AcceptType.ApplicationPdf)) {
      const pdfContent = await this.ARAgingSummaryApp.pdf(filter);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfContent.length,
      });
      res.send(pdfContent);
      // Retrieves the json format.
    } else {
      return this.ARAgingSummaryApp.sheet(filter);
    }
  }
}
