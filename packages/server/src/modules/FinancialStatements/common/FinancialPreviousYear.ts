import * as R from 'ramda';
import { sumBy } from 'lodash';
import {
  IFinancialCommonHorizDatePeriodNode,
  IFinancialCommonNode,
  IFinancialNodeWithPreviousYear,
} from '../types/Report.types';
import { GConstructor } from '@/common/types/Constructor';
import { FinancialSheet } from './FinancialSheet';
import { FinancialDatePeriods } from './FinancialDatePeriods';

export const FinancialPreviousYear = <T extends GConstructor<FinancialSheet>>(
  Base: T,
) =>
  class extends R.compose(FinancialDatePeriods)(Base) {
    // ---------------------------
    // # Common Node
    // ---------------------------
    /**
     * Assoc previous year change attribute to account node.
     * @param {IFinancialCommonNode & IFinancialNodeWithPreviousYear} accountNode
     * @returns  {IFinancialNodeWithPreviousYear}
     */
    public assocPreviousYearChangetNode = (
      node: IFinancialCommonNode & IFinancialNodeWithPreviousYear,
    ): IFinancialNodeWithPreviousYear => {
      const change = this.getAmountChange(
        node.total.amount,
        node.previousYear.amount,
      );
      return R.assoc('previousYearChange', this.getAmountMeta(change), node);
    };

    /**
     * Assoc previous year percentage attribute to account node.
     * % increase = Increase ÷ Original Number × 100.
     *
     * @param   {IProfitLossSheetAccountNode} accountNode
     * @returns {IProfitLossSheetAccountNode}
     */
    public assocPreviousYearPercentageNode = (
      node: IFinancialCommonNode & IFinancialNodeWithPreviousYear,
    ): IFinancialNodeWithPreviousYear => {
      const percentage = this.getPercentageBasis(
        node.previousYear.amount,
        node.previousYearChange.amount,
      );
      return R.assoc(
        'previousYearPercentage',
        this.getPercentageAmountMeta(percentage),
        node,
      );
    };

    /**
     * Assoc previous year change attribute to account node.
     * @param    {IProfitLossSheetAccountNode} accountNode
     * @returns  {IProfitLossSheetAccountNode}
     */
    public assocPreviousYearTotalChangeNode = (
      node: IFinancialCommonNode & IFinancialNodeWithPreviousYear,
    ): IFinancialNodeWithPreviousYear => {
      const change = this.getAmountChange(
        node.total.amount,
        node.previousYear.amount,
      );
      return R.assoc(
        'previousYearChange',
        this.getTotalAmountMeta(change),
        node,
      );
    };

    /**
     * Assoc previous year percentage attribute to account node.
     * @param   {IProfitLossSheetAccountNode} accountNode
     * @returns {IProfitLossSheetAccountNode}
     */
    public assocPreviousYearTotalPercentageNode = (
      node: IFinancialCommonNode & IFinancialNodeWithPreviousYear,
    ): IFinancialNodeWithPreviousYear => {
      const percentage = this.getPercentageBasis(
        node.previousYear.amount,
        node.previousYearChange.amount,
      );
      return R.assoc(
        'previousYearPercentage',
        this.getPercentageTotalAmountMeta(percentage),
        node,
      );
    };

    /**
     * Assoc previous year from/to date to horizontal nodes.
     * @param horizNode
     * @returns
     */
    public assocPreviousYearHorizNodeFromToDates = (
      horizNode: IFinancialCommonHorizDatePeriodNode,
    ) => {
      const PYFromDate = this.getPreviousYearDate(horizNode.fromDate.date);
      const PYToDate = this.getPreviousYearDate(horizNode.toDate.date);

      return R.compose(
        R.assoc('previousYearToDate', this.getDateMeta(PYToDate)),
        R.assoc('previousYearFromDate', this.getDateMeta(PYFromDate)),
      )(horizNode);
    };

    /**
     * Retrieves PP total sumation of the given horiz index node.
     * @param   {number} index
     * @param   {} node
     * @returns {number}
     */
    public getPYHorizNodesTotalSumation = (index: number, node): number => {
      return sumBy(
        node.children,
        `horizontalTotals[${index}].previousYear.amount`,
      );
    };
  };
