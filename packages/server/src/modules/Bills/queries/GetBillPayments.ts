import { Inject, Injectable } from '@nestjs/common';
import { BillPaymentEntry } from '@/modules/BillPayments/models/BillPaymentEntry';
import { BillPaymentTransactionTransformer } from '@/modules/BillPayments/queries/BillPaymentTransactionTransformer';
import { TransformerInjectable } from '@/modules/Transformer/TransformerInjectable.service';

@Injectable()
export class GetBillPayments {
  constructor(
    @Inject(BillPaymentEntry.name)
    private billPaymentEntryModel: typeof BillPaymentEntry,
    private transformer: TransformerInjectable,
  ) {}

  /**
   * Retrieve the specific bill associated payment transactions.
   * @param {number} billId - Bill id.
   */
  public getBillPayments = async (billId: number) => {
    const billsEntries = await this.billPaymentEntryModel
      .query()
      .where('billId', billId)
      .withGraphJoined('payment.paymentAccount')
      .withGraphJoined('bill')
      .orderBy('payment:paymentDate', 'ASC');

    return this.transformer.transform(
      billsEntries,
      new BillPaymentTransactionTransformer(),
    );
  };
}
