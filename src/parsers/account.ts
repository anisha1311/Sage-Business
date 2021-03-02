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
            'accountSubType': 1, 
            'classification': 'Income', //account.Classification,
            'active': account.IsActive,           
            'parentAccountId': 1, //this.getParentId(account.ParentAccount.Type), 
            'parentAccountName': 'Bank', // account.ParentAccount!== null ? account.ParentAccount.Name : 
            'accountNumber': account.BankingDetails !== null? (account.BankingDetails.BankAccountNumber !== null ? (account.BankingDetails.BankAccountNumber).toString() : ' ') : ' ',
        }        
    
        return parseData;
    }

    getParentId(parentAccountName:string){
        let idMap:any = {
            'Bank':1,
            'AccountReceivable':2,
            'CurrentAsset' :3,
            'OtherCurrentAsset' :3,
            'OtherAsset' :4,
            'FixedAsset':5,
            'CreditCard':6,
            'AccountsPayable':7,
            'OtherCurrentLiability':8,
            'LongTermLiability':9,
            'Equity':10,
            'CostOfGoodsSold':11,
            'Expense':12,
            'OtherExpense':13,
            'Income':14,
            'OtherIncome':15
        }
        return idMap[parentAccountName];
    }


}


