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
            let length = accounts.Items.length || 0;
            if (accounts && length > 0) {
                let parsedAccounts: any = [];
                for (let i = 0; i < length; i++) {
                    const account = accounts.Items[i];
                    parsedAccounts.push(this.parse(account, businessId))
                }
                
                return parsedAccounts;
            }
            else {
               // logger.info("No Chart of Accounts")
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
            'platformAccountId': account.UID,
            'name': account.Name,
            'accountSubType':  1, //  account.ParentAccount!== null? this.getParentId(account.ParentAccount.Name): ''
            'classification':  'Liability', //account.Classification ||
            'active': account.IsActive,           
            'parentAccountId': account.ParentAccount!== null? this.getParentId(account.ParentAccount.Name): 1 ,
            'parentAccountName':  'Bank', // account.ParentAccount!== null?  account.ParentAccount.Name ://hardcoded
             //'accountNumber': account.BankingDetails !== null? account.BankingDetails.BankAccountNumber: 12324324,
        }        
    
        return parseData;
    }

    /**
     * Will Check for Account Types and Return Category type if "Income/Expense" else return accounttype Value as accountSubType
     * @param accountType 
     * @param accountSubType 
     */
    getAccountType(accountType: string) {
        if (accountType === ChartOfAccountKeys.income || accountType === ChartOfAccountKeys.expense) {
            return this.findSubAccountType(accountType === ChartOfAccountKeys.income, accountType)
        }
        else {
            return this.getParentOrCategoryAccountId(accountType);
        }
    }

    getParentId(parentAccountName:string){
        let idMap:any = {
            'Bank':1,
            'Account Receivable':2,
            'Other Current Asset' :3,
            'Other Asset' :4,
            'Fixed Asset':5,
            'Credit Card':6,
            'Accounts Payable':7,
            'Other Current Liability':8,
            'Long Term Liability':9,
            'Equity':10,
            'Cost Of Goods Sold':11,
            'Expense':12,
            'Other Expense':13,
            'Income':14,
            'Other Income':15
        }
        return idMap[parentAccountName] || 1;
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


