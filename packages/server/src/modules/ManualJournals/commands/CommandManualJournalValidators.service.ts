import { Inject, Injectable } from '@nestjs/common';
import { difference, isEmpty, round, sumBy } from 'lodash';
import { ERRORS } from '../constants';
import { ServiceError } from '@/modules/Items/ServiceError';
import { Account } from '@/modules/Accounts/models/Account.model';
import { ManualJournal } from '../models/ManualJournal';
import { Contact } from '@/modules/Contacts/models/Contact';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import {
  CreateManualJournalDto,
  EditManualJournalDto,
  ManualJournalEntryDto,
} from '../dtos/ManualJournal.dto';

@Injectable()
export class CommandManualJournalValidators {
  constructor(
    @Inject(Account.name)
    private readonly accountModel: TenantModelProxy<typeof Account>,

    @Inject(ManualJournal.name)
    private readonly manualJournalModel: TenantModelProxy<typeof ManualJournal>,

    @Inject(Contact.name)
    private readonly contactModel: TenantModelProxy<typeof Contact>,
  ) {}

  /**
   * Validate manual journal credit and debit should be equal.
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   */
  public valdiateCreditDebitTotalEquals(
    manualJournalDTO: CreateManualJournalDto | EditManualJournalDto,
  ) {
    const totalCredit = round(
      sumBy(manualJournalDTO.entries, (entry) => entry.credit || 0),
      2,
    );
    const totalDebit = round(
      sumBy(manualJournalDTO.entries, (entry) => entry.debit || 0),
      2,
    );
    if (totalCredit <= 0 || totalDebit <= 0) {
      throw new ServiceError(ERRORS.CREDIT_DEBIT_NOT_EQUAL_ZERO);
    }
    if (totalCredit !== totalDebit) {
      throw new ServiceError(ERRORS.CREDIT_DEBIT_NOT_EQUAL);
    }
  }

  /**
   * Validate manual entries accounts existance on the storage.
   * @param {number} tenantId -
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO -
   */
  public async validateAccountsExistance(
    manualJournalDTO: CreateManualJournalDto | EditManualJournalDto,
  ) {
    const manualAccountsIds = manualJournalDTO.entries.map((e) => e.accountId);
    const accounts = await this.accountModel()
      .query()
      .whereIn('id', manualAccountsIds);

    const storedAccountsIds = accounts.map((account) => account.id);

    if (difference(manualAccountsIds, storedAccountsIds).length > 0) {
      throw new ServiceError(ERRORS.ACCOUNTS_IDS_NOT_FOUND);
    }
  }

  /**
   * Validate manual journal number unique.
   * @param {number} tenantId
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   */
  public async validateManualJournalNoUnique(
    journalNumber: string,
    notId?: number,
  ) {
    const journals = await this.manualJournalModel()
      .query()
      .where('journal_number', journalNumber)
      .onBuild((builder) => {
        if (notId) {
          builder.whereNot('id', notId);
        }
      });
    if (journals.length > 0) {
      throw new ServiceError(
        ERRORS.JOURNAL_NUMBER_EXISTS,
        'The journal number is already exist.',
      );
    }
  }

  /**
   * Validate accounts with contact type.
   * @param {number} tenantId
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   * @param {string} accountBySlug
   * @param {string} contactType
   */
  public async validateAccountWithContactType(
    entriesDTO: ManualJournalEntryDto[],
    accountBySlug: string,
    contactType: string,
  ): Promise<void | ServiceError> {
    // Retrieve account meta by the given account slug.
    const account = await this.accountModel()
      .query()
      .findOne('slug', accountBySlug);

    // Retrieve all stored contacts on the storage from contacts entries.
    const storedContacts = await this.contactModel()
      .query()
      .whereIn(
        'id',
        entriesDTO
          .filter((entry) => entry.contactId)
          .map((entry) => entry.contactId),
      );
    // Converts the stored contacts to map with id as key and entry as value.
    const storedContactsMap = new Map(
      storedContacts.map((contact) => [contact.id, contact]),
    );

    // Filter all entries of the given account.
    const accountEntries = entriesDTO.filter(
      (entry) => entry.accountId === account.id,
    );
    // Can't continue if there is no entry that associate to the given account.
    if (accountEntries.length === 0) {
      return;
    }
    // Filter entries that have no contact type or not equal the valid type.
    const entriesNoContact = accountEntries.filter((entry) => {
      const contact = storedContactsMap.get(entry.contactId);
      return !contact || contact.contactService !== contactType;
    });
    // Throw error in case one of entries that has invalid contact type.
    if (entriesNoContact.length > 0) {
      const indexes = entriesNoContact.map((e) => e.index);

      return new ServiceError(ERRORS.ENTRIES_SHOULD_ASSIGN_WITH_CONTACT, '', {
        accountSlug: accountBySlug,
        contactType,
        indexes,
      });
    }
  }

  /**
   * Dynamic validates accounts with contacts.
   * @param {number} tenantId
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   */
  public async dynamicValidateAccountsWithContactType(
    entriesDTO: ManualJournalEntryDto[],
  ): Promise<any> {
    return Promise.all([
      this.validateAccountWithContactType(
        entriesDTO,
        'accounts-receivable',
        'customer',
      ),
      this.validateAccountWithContactType(
        entriesDTO,
        'accounts-payable',
        'vendor',
      ),
    ]).then((results) => {
      const metadataErrors = results
        .filter((result) => result instanceof ServiceError)
        .map((result: ServiceError) => result.payload);

      if (metadataErrors.length > 0) {
        throw new ServiceError(
          ERRORS.ENTRIES_SHOULD_ASSIGN_WITH_CONTACT,
          '',
          metadataErrors,
        );
      }

      return results;
    });
  }

  /**
   * Validate entries contacts existance.
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   */
  public async validateContactsExistance(
    manualJournalDTO: CreateManualJournalDto | EditManualJournalDto,
  ) {
    // Filters the entries that have contact only.
    const entriesContactPairs = manualJournalDTO.entries.filter(
      (entry) => entry.contactId,
    );

    if (entriesContactPairs.length > 0) {
      const entriesContactsIds = entriesContactPairs.map(
        (entry) => entry.contactId,
      );
      // Retrieve all stored contacts on the storage from contacts entries.
      const storedContacts = await this.contactModel()
        .query()
        .whereIn('id', entriesContactsIds);

      // Converts the stored contacts to map with id as key and entry as value.
      const storedContactsMap = new Map(
        storedContacts.map((contact) => [contact.id, contact]),
      );
      const notFoundContactsIds = [];

      entriesContactPairs.forEach((contactEntry) => {
        const storedContact = storedContactsMap.get(contactEntry.contactId);

        // in case the contact id not found.
        if (!storedContact) {
          notFoundContactsIds.push(storedContact);
        }
      });
      if (notFoundContactsIds.length > 0) {
        throw new ServiceError(ERRORS.CONTACTS_NOT_FOUND, '', {
          contactsIds: notFoundContactsIds,
        });
      }
    }
  }

  /**
   * Validates expenses is not already published before.
   * @param {ManualJournal} manualJournal
   */
  public validateManualJournalIsNotPublished(manualJournal: ManualJournal) {
    if (manualJournal.publishedAt) {
      throw new ServiceError(ERRORS.MANUAL_JOURNAL_ALREADY_PUBLISHED);
    }
  }

  /**
   * Validates the manual journal number require.
   * @param {string} journalNumber
   * @throws {ServiceError(ERRORS.MANUAL_JOURNAL_NO_REQUIRED)}
   */
  public validateJournalNoRequireWhenAutoNotEnabled = (
    journalNumber: string,
  ) => {
    if (isEmpty(journalNumber)) {
      throw new ServiceError(ERRORS.MANUAL_JOURNAL_NO_REQUIRED);
    }
  };

  /**
   * Filters the not published manual jorunals.
   * @param {IManualJournal[]} manualJournal - Manual journal.
   * @return {IManualJournal[]}
   */
  public getNonePublishedManualJournals(
    manualJournals: ManualJournal[],
  ): ManualJournal[] {
    return manualJournals.filter((manualJournal) => !manualJournal.publishedAt);
  }

  /**
   * Filters the published manual journals.
   * @param {IManualJournal[]} manualJournal - Manual journal.
   * @return {IManualJournal[]}
   */
  public getPublishedManualJournals(
    manualJournals: ManualJournal[],
  ): ManualJournal[] {
    return manualJournals.filter((expense) => expense.publishedAt);
  }

  /**
   *
   * @param {CreateManualJournalDto | EditManualJournalDto} manualJournalDTO
   */
  public validateJournalCurrencyWithAccountsCurrency = async (
    manualJournalDTO: CreateManualJournalDto | EditManualJournalDto,
    baseCurrency: string,
  ) => {
    const accountsIds = manualJournalDTO.entries.map((e) => e.accountId);
    const accounts = await this.accountModel()
      .query()
      .whereIn('id', accountsIds);

    // Filters the accounts that has no base currency or DTO currency.
    const notSupportedCurrency = accounts.filter((account) => {
      if (
        account.currencyCode === baseCurrency ||
        account.currencyCode === manualJournalDTO.currencyCode
      ) {
        return false;
      }
      return true;
    });
    if (notSupportedCurrency.length > 0) {
      throw new ServiceError(
        ERRORS.COULD_NOT_ASSIGN_DIFFERENT_CURRENCY_TO_ACCOUNTS,
      );
    }
  };
}
