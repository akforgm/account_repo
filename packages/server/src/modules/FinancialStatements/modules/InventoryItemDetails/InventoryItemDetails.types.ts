import {
  IFinancialSheetCommonMeta,
  INumberFormatQuery,
} from '../../types/Report.types';
import { IFinancialTable } from '../../types/Table.types';

export interface IInventoryDetailsQuery {
  fromDate: Date | string;
  toDate: Date | string;
  numberFormat: INumberFormatQuery;
  noneTransactions: boolean;
  itemsIds: number[];

  warehousesIds?: number[];
  branchesIds?: number[];
}

export interface IInventoryDetailsNumber {
  number: number;
  formattedNumber: string;
}

export interface IInventoryDetailsMoney {
  amount: number;
  formattedAmount: string;
  currencyCode: string;
}

export interface IInventoryDetailsDate {
  date: Date;
  formattedDate: string;
}

export interface IInventoryDetailsOpening {
  nodeType: 'OPENING_ENTRY';
  date: IInventoryDetailsDate;
  quantity: IInventoryDetailsNumber;
  value: IInventoryDetailsNumber;
}

export interface IInventoryDetailsClosing
  extends Omit<IInventoryDetailsOpening, 'nodeType'> {
  nodeType: 'CLOSING_ENTRY';
  profitMargin: IInventoryDetailsNumber;
}

export interface IInventoryDetailsItem {
  id: number;
  nodeType: string;
  name: string;
  code: string;
  children: (
    | IInventoryDetailsItemTransaction
    | IInventoryDetailsOpening
    | IInventoryDetailsClosing
  )[];
}

export interface IInventoryDetailsItemTransaction {
  nodeType: string;
  date: IInventoryDetailsDate;
  transactionType: string;
  transactionNumber?: string;

  quantityMovement: IInventoryDetailsNumber;
  valueMovement: IInventoryDetailsNumber;

  quantity: IInventoryDetailsNumber;
  total: IInventoryDetailsNumber;
  cost: IInventoryDetailsNumber;
  value: IInventoryDetailsNumber;
  profitMargin: IInventoryDetailsNumber;

  rate: IInventoryDetailsNumber;

  runningQuantity: IInventoryDetailsNumber;
  runningValuation: IInventoryDetailsNumber;

  direction: string;
}

export type IInventoryDetailsNode =
  | IInventoryDetailsItem
  | IInventoryDetailsItemTransaction;
export type IInventoryDetailsData = IInventoryDetailsItem[];

export interface IInventoryItemDetailMeta extends IFinancialSheetCommonMeta {
  formattedFromDate: string;
  formattedToDay: string;
  formattedDateRange: string;
}

export interface IInvetoryItemDetailDOO {
  data: IInventoryDetailsData;
  query: IInventoryDetailsQuery;
  meta: IInventoryItemDetailMeta;
}

export interface IInvetoryItemDetailsTable extends IFinancialTable {
  query: IInventoryDetailsQuery;
  meta: IInventoryItemDetailMeta;
}
