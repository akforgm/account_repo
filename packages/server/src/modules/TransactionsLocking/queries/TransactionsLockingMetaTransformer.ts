import { get } from 'lodash';
import { getTransactionsLockingSchemaMeta } from '../constants';
import { Transformer } from '@/modules/Transformer/Transformer';
import { TransactionsLockingGroup } from '../types/TransactionsLocking.types';

export class TransactionsLockingMetaTransformer extends Transformer {
  /**
   * Include these attributes to sale credit note object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'module',
      'formattedModule',
      'description',
      'formattedLockToDate',
      'formattedUnlockFromDate',
      'formattedUnlockToDate',
    ];
  };

  /**
   * Module slug.
   * @returns {string}
   */
  protected module = () => {
    return this.options.module;
  };

  /**
   * Formatted module name.
   * @returns {string}
   */
  protected formattedModule = () => {
    return this.options.module === TransactionsLockingGroup.All
      ? this.context.i18n.t('transactions_locking.module.all_transactions')
      : this.context.i18n.t(
          get(
            getTransactionsLockingSchemaMeta(this.options.module),
            'formattedModule',
          ),
        );
  };

  /**
   * Module description.
   * @returns {string}
   */
  protected description = () => {
    return this.options.module === TransactionsLockingGroup.All
      ? ''
      : this.context.i18n.t(
          get(
            getTransactionsLockingSchemaMeta(this.options.module),
            'description',
          ),
        );
  };

  /**
   * Formatted unlock to date.
   * @returns {string}
   */
  protected formattedUnlockToDate = (item) => {
    return item.unlockToDate ? this.formatDate(item.unlockToDate) : '';
  };

  /**
   * Formatted unlock from date.
   * @returns {string}
   */
  protected formattedUnlockFromDate = (item) => {
    return item.unlockFromDate ? this.formatDate(item.unlockFromDate) : '';
  };

  /**
   * Formatted lock to date.
   * @returns {string}
   */
  protected formattedLockToDate = (item) => {
    return item.lockToDate ? this.formatDate(item.lockToDate) : '';
  };
}
