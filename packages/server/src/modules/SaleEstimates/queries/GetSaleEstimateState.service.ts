import { Inject, Injectable } from '@nestjs/common';
import { PdfTemplateModel } from '@/modules/PdfTemplate/models/PdfTemplate';
import { ISaleEstimateState } from '../types/SaleEstimates.types';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class GetSaleEstimateState {
  constructor(
    @Inject(PdfTemplateModel.name)
    private pdfTemplateModel: TenantModelProxy<typeof PdfTemplateModel>,
  ) {}

  /**
   * Retrieves the create/edit sale estimate state.
   * @return {Promise<ISaleEstimateState>}
   */
  public async getSaleEstimateState(): Promise<ISaleEstimateState> {
    const defaultPdfTemplate = await this.pdfTemplateModel()
      .query()
      .findOne({ resource: 'SaleEstimate' })
      .modify('default');

    return {
      defaultTemplateId: defaultPdfTemplate?.id,
    };
  }
}
