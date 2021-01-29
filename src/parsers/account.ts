import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class ChartOfAccountParser {
    subAccountTypesValues = (subaccounttypesdata as any).default;

    /**
     * will parse the charts of accounts
     * @param accounts 
     * @param businessId 
     */
     public parseChartofAccounts(accounts: any, businessId: string) {
        try {
            let length = accounts.length || 0;
            if (accounts && length > 0) {
                let parsedAccounts: any = [];
                for (let i = 0; i < length; i++) {
                    const account = accounts[i];
                    parsedAccounts.push(this.parse(account, businessId))
                }

                return parsedAccounts;
            }
            else {
                logger.info("No Chart of Accounts")
            }
        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseAccountsError)
        }
    }

    /**
     * Parse the COA
     * @param account 
     * @param businessId 
     */
    parse(account: any, businessId: string) {
        let parseData = {
            'businessId': businessId,
            'platformAccountId': account.Id,
            'name': account.FullyQualifiedName,
            'accountSubType': this.getAccountType(account.AccountType, account.AccountSubType),
            'parentAccountName': account.AccountType,
            'classification': account.Classification,
            'active': account.Active,
            'accountNumber': account.AcctNum,
            'parentAccountId': this.getParentOrCategoryAccountId(account.AccountType)
        }

        return parseData;
    }

    /**
     * Will Check for Account Types and Return Category type if "Income/Expense" else return accounttype Value as accountSubType
     * @param accountType 
     * @param accountSubType 
     */
    getAccountType(accountType: string, accountSubType: string) {
        if (accountType === ChartOfAccountKeys.income || accountType === ChartOfAccountKeys.expense) {
            return this.findSubAccountType(accountType === ChartOfAccountKeys.income, accountSubType)
        }
        else {
            return this.getParentOrCategoryAccountId(accountType);
        }
    }

    /**
     * will seach Category name of Income Type or Expense Type and will return if category found , 
       else return "Other Income" or "Other Expense" based on isIncome or IsExpense
     * @param isIncome 
     * @param item 
     */
    findSubAccountType(isIncome: boolean, item: any) {
        let searchIn = isIncome ? data.Income : data.Expense;
        let length = Object.keys(searchIn).length;
        let isFound = false;
        for (let i = 0; i < length; i++) {
            let array = Object.values(searchIn)[i];
            let key = Object.keys(searchIn)[i]
            if (array) {
                let containValue = array.includes(item);

                if (containValue) {
                    let id = this.getParentOrCategoryAccountId(key);
                    return id
                }
                else {
                    isFound = false;
                }
            }
        }

        if (!isFound) {
            if (isIncome) {
                let id = this.getParentOrCategoryAccountId(ChartOfAccountKeys.otherIncome);
                return id;

            }
            else {
                let id = this.getParentOrCategoryAccountId(ChartOfAccountKeys.otherExpense);
                return id
            }

        }
    }

    /**
     * will return parent account id 
     * @param key 
     */
    getParentOrCategoryAccountId(key: string): number {
        if (key) {
            let subacc = _.find(this.subAccountTypesValues, { name: key.toLocaleLowerCase() });
            if (subacc) return Number(subacc.value)
            else throw new Error(Constant.busResMsg.accountTypeNotFound)
        } else {
            logger.info('getParentOrCategoryAccountId: key is undefined')
             throw new Error(Constant.busResMsg.accountTypeNotFound)
        }

    }
}


