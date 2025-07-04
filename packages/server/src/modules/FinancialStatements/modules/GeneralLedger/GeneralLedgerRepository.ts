import * as moment from 'moment';
import * as R from 'ramda';
import { IGeneralLedgerSheetQuery } from './GeneralLedger.types';
import { flatten, isEmpty, uniq } from 'lodash';
import { ModelObject } from 'objection';
import { Account } from '@/modules/Accounts/models/Account.model';
import { AccountTransaction } from '@/modules/Accounts/models/AccountTransaction.model';
import { Contact } from '@/modules/Contacts/models/Contact';
import { AccountRepository } from '@/modules/Accounts/repositories/Account.repository';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { transformToMap } from '@/utils/transform-to-key';
import { Ledger } from '@/modules/Ledger/Ledger';
import { TenantModel } from '@/modules/System/models/TenantModel';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable({ scope: Scope.TRANSIENT })
export class GeneralLedgerRepository {
  public filter: IGeneralLedgerSheetQuery;
  public accounts: Account[];

  public transactions: AccountTransaction[];
  public openingBalanceTransactions: AccountTransaction[];

  public transactionsLedger: Ledger;
  public openingBalanceTransactionsLedger: Ledger;

  public repositories: any;
  public models: any;
  public accountsGraph: any;

  public contacts: ModelObject<Contact>[];
  public contactsById: Map<number, ModelObject<Contact>>;

  public tenantId: number;
  public tenant: TenantModel;

  public accountNodesIncludeTransactions: Array<number> = [];
  public accountNodeInclude: Array<number> = [];

  @Inject(AccountRepository)
  private readonly accountRepository: AccountRepository;

  @Inject(AccountTransaction.name)
  private readonly accountTransactionModel: TenantModelProxy<
    typeof AccountTransaction
  >;

  @Inject(Contact.name)
  private readonly contactModel: TenantModelProxy<typeof Contact>;

  @Inject(TenancyContext)
  private readonly tenancyContext: TenancyContext;

  /**
   * Set the filter.
   * @param {IGeneralLedgerSheetQuery} filter - The filter.
   */
  setFilter(filter: IGeneralLedgerSheetQuery) {
    this.filter = filter;
  }

  /**
   * Initialize the G/L report.
   */
  public async asyncInitialize() {
    await this.initTenant();
    await this.initAccounts();
    await this.initAccountsGraph();
    await this.initContacts();
    await this.initAccountsOpeningBalance();
    this.initAccountNodesIncludeTransactions();
    await this.initTransactions();
    this.initAccountNodesIncluded();
  }

  /**
   * Initialize the tenant.
   */
  public async initTenant() {
    this.tenant = await this.tenancyContext.getTenant(true);
  }

  /**
   * Initialize the accounts.
   */
  public async initAccounts() {
    // @ts-ignore
    this.accounts = await this.accountRepository.all().orderBy('name', 'ASC');
  }

  /**
   * Initialize the accounts graph.
   */
  public async initAccountsGraph() {
    this.accountsGraph = await this.accountRepository.getDependencyGraph();
  }

  /**
   * Initialize the contacts.
   */
  public async initContacts() {
    this.contacts = await this.contactModel().query();
    this.contactsById = transformToMap(this.contacts, 'id');
  }

  /**
   * Initialize the G/L transactions from/to the given date.
   */
  public async initTransactions() {
    this.transactions = await this.accountTransactionModel()
      .query()
      .onBuild((query) => {
        query.modify(
          'filterDateRange',
          this.filter.fromDate,
          this.filter.toDate,
        );
        if (!isEmpty(this.filter.branchesIds)) {
          query.modify('filterByBranches', this.filter.branchesIds);
        }
        query.orderBy('date', 'ASC');

        if (this.filter.accountsIds?.length > 0) {
          query.whereIn('accountId', this.accountNodesIncludeTransactions);
        }
        query.withGraphFetched('account');
      });
    // Transform array transactions to journal collection.
    this.transactionsLedger = Ledger.fromTransactions(this.transactions);
  }

  /**
   * Initialize the G/L accounts opening balance.
   */
  public async initAccountsOpeningBalance() {
    // Retrieves opening balance credit/debit sumation.
    this.openingBalanceTransactions = await this.accountTransactionModel()
      .query()
      .onBuild((query) => {
        const toDate = moment(this.filter.fromDate).subtract(1, 'day');

        query.modify('sumationCreditDebit');
        query.modify('filterDateRange', null, toDate);

        if (!isEmpty(this.filter.branchesIds)) {
          query.modify('filterByBranches', this.filter.branchesIds);
        }
        query.withGraphFetched('account');
      });
    // Accounts opening transactions.
    this.openingBalanceTransactionsLedger = Ledger.fromTransactions(
      this.openingBalanceTransactions,
    );
  }

  /**
   * Initialize the account nodes that should include transactions.
   * @returns {void}
   */
  public initAccountNodesIncludeTransactions() {
    if (isEmpty(this.filter.accountsIds)) {
      return;
    }
    const childrenNodeIds = this.filter.accountsIds?.map(
      (accountId: number) => {
        return this.accountsGraph.dependenciesOf(accountId);
      },
    );
    const nodeIds = R.concat(this.filter.accountsIds, childrenNodeIds);

    this.accountNodesIncludeTransactions = uniq(flatten(nodeIds));
  }

  /**
   * Initialize the account node ids should be included,
   * if the filter by acounts is presented.
   * @returns {void}
   */
  public initAccountNodesIncluded() {
    if (isEmpty(this.filter.accountsIds)) {
      return;
    }
    const nodeIds = this.filter.accountsIds.map((accountId) => {
      const childrenIds = this.accountsGraph.dependenciesOf(accountId);
      const parentIds = this.accountsGraph.dependantsOf(accountId);

      return R.concat(childrenIds, parentIds);
    });
    // @ts-ignore\
    this.accountNodeInclude = R.compose(
      R.uniq,
      R.flatten,
      R.concat(this.filter.accountsIds),
    )(nodeIds);
  }
}
