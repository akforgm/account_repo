// @ts-nocheck
import * as R from 'ramda';
import { get } from 'lodash';
import { ProfitLossSheetBase } from './ProfitLossSheetBase';
import { ProfitLossSheetQuery } from './ProfitLossSheetQuery';
import { GConstructor } from '@/common/types/Constructor';
import { FinancialSheet } from '../../common/FinancialSheet';
import { FinancialFilter } from '../../common/FinancialFilter';
import {
  IProfitLossSheetNode,
  ProfitLossNodeType,
} from './ProfitLossSheet.types';
import { ProfitLossSheetRepository } from './ProfitLossSheetRepository';

export const ProfitLossSheetFilter = <T extends GConstructor<FinancialSheet>>(
  Base: T,
) =>
  class extends R.pipe(FinancialFilter, ProfitLossSheetBase)(Base) {
    query: ProfitLossSheetQuery;
    repository: ProfitLossSheetRepository;

    // ----------------
    // # Account.
    // ----------------
    /**
     * Filter report node detarmine.
     * @param {IProfitLossSheetNode} node - Balance sheet node.
     * @return {boolean}
     */
    private accountNoneZeroNodesFilterDetarminer = (
      node: IProfitLossSheetNode,
    ): boolean => {
      return R.ifElse(
        this.isNodeType(ProfitLossNodeType.ACCOUNT),
        this.isNodeNoneZero,
        R.always(true),
      )(node);
    };

    /**
     * Determines account none-transactions node.
     * @param {IBalanceSheetDataNode} node
     * @returns {boolean}
     */
    private accountNoneTransFilterDetarminer = (
      node: IProfitLossSheetNode,
    ): boolean => {
      return R.ifElse(
        this.isNodeType(ProfitLossNodeType.ACCOUNT),
        this.isNodeNoneZero,
        R.always(true),
      )(node);
    };

    /**
     * Report nodes filter.
     * @param {IProfitLossSheetNode[]} nodes -
     * @return {IProfitLossSheetNode[]}
     */
    private accountsNoneZeroNodesFilter = (
      nodes: IProfitLossSheetNode[],
    ): IProfitLossSheetNode[] => {
      return this.filterNodesDeep(
        nodes,
        this.accountNoneZeroNodesFilterDetarminer,
      );
    };

    /**
     * Filters the accounts none-transactions nodes.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    private accountsNoneTransactionsNodesFilter = (
      nodes: IProfitLossSheetNode[],
    ) => {
      return this.filterNodesDeep(nodes, this.accountNoneTransFilterDetarminer);
    };

    // ----------------
    // # Aggregate.
    // ----------------
    /**
     * Determines aggregate none-children filtering.
     * @param {IProfitLossSheetNode} node
     * @returns {boolean}
     */
    private aggregateNoneChildrenFilterDetarminer = (
      node: IProfitLossSheetNode,
    ): boolean => {
      const schemaNode = this.getSchemaNodeById(node.id);

      // Determines whether the given node is aggregate node.
      const isAggregateNode = this.isNodeType(
        ProfitLossNodeType.ACCOUNTS,
        node,
      );
      // Determines if the schema node is always should show.
      const isSchemaAlwaysShow = get(schemaNode, 'alwaysShow', false);

      // Should node has children if aggregate node or not always show.
      return isAggregateNode && !isSchemaAlwaysShow
        ? this.isNodeHasChildren(node)
        : true;
    };

    /**
     * Filters aggregate none-children nodes.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    private aggregateNoneChildrenFilter = (
      nodes: IProfitLossSheetNode[],
    ): IProfitLossSheetNode[] => {
      return this.filterNodesDeep2(
        this.aggregateNoneChildrenFilterDetarminer,
        nodes,
      );
    };

    // ----------------
    // # Composers.
    // ----------------
    /**
     * Filters none-zero nodes.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    private filterNoneZeroNodesCompose = (
      nodes: IProfitLossSheetNode[],
    ): IProfitLossSheetNode[] => {
      return R.compose(
        this.aggregateNoneChildrenFilter,
        this.accountsNoneZeroNodesFilter,
      )(nodes);
    };

    /**
     * Filters none-transactions nodes.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    private filterNoneTransNodesCompose = (
      nodes: IProfitLossSheetNode[],
    ): IProfitLossSheetNode[] => {
      return R.compose(
        this.aggregateNoneChildrenFilter,
        this.accountsNoneTransactionsNodesFilter,
      )(nodes);
    };

    /**
     * Supress nodes when total accounts range transactions is empty.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    private supressNodesWhenRangeTransactionsEmpty = (
      nodes: IProfitLossSheetNode[],
    ) => {
      return this.repository.totalAccountsLedger.isEmpty() ? [] : nodes;
    };

    /**
     * Compose report nodes filtering.
     * @param {IProfitLossSheetNode[]} nodes
     * @returns {IProfitLossSheetNode[]}
     */
    protected reportFilterPlugin = (
      nodes: IProfitLossSheetNode[],
    ): IProfitLossSheetNode[] => {
      return R.compose(
        this.supressNodesWhenRangeTransactionsEmpty,
        R.when(() => this.query.noneZero, this.filterNoneZeroNodesCompose),
        R.when(
          () => this.query.noneTransactions,
          this.filterNoneTransNodesCompose,
        ),
      )(nodes);
    };
  };
