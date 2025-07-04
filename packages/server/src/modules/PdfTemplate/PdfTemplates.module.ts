import { Module } from '@nestjs/common';
import { TenancyContext } from '../Tenancy/TenancyContext.service';
import { TenancyDatabaseModule } from '../Tenancy/TenancyDB/TenancyDB.module';
import { TransformerInjectable } from '../Transformer/TransformerInjectable.service';
import { AssignPdfTemplateDefaultService } from './commands/AssignPdfTemplateDefault.service';
import { CreatePdfTemplateService } from './commands/CreatePdfTemplate.service';
import { DeletePdfTemplateService } from './commands/DeletePdfTemplate.service';
import { EditPdfTemplateService } from './commands/EditPdfTemplate.service';
import { PdfTemplateApplication } from './PdfTemplate.application';
import { PdfTemplatesController } from './PdfTemplates.controller';
import { GetPdfTemplateService } from './queries/GetPdfTemplate.service';
import { BrandingTemplateDTOTransformer } from './BrandingTemplateDTOTransformer';
import { GetOrganizationBrandingAttributesService } from './queries/GetOrganizationBrandingAttributes.service';
import { GetPdfTemplates } from './queries/GetPdfTemplates.service';
import { GetPdfTemplateBrandingState } from './queries/GetPdfTemplateBrandingState.service';

@Module({
  exports: [
    GetPdfTemplateService,
    BrandingTemplateDTOTransformer,
    GetOrganizationBrandingAttributesService,
  ],
  imports: [TenancyDatabaseModule],
  controllers: [PdfTemplatesController],
  providers: [
    PdfTemplateApplication,
    CreatePdfTemplateService,
    DeletePdfTemplateService,
    GetPdfTemplateService,
    GetPdfTemplates,
    EditPdfTemplateService,
    AssignPdfTemplateDefaultService,
    TenancyContext,
    TransformerInjectable,
    BrandingTemplateDTOTransformer,
    GetOrganizationBrandingAttributesService,
    GetPdfTemplateBrandingState
  ],
})
export class PdfTemplatesModule {}
