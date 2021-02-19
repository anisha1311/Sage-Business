import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
export class JournalTransactionParser {
    /**
     * will parse the Suppliers
     * @param itemInfo 
     * @param businessId 
     */
     public parseJournalTransaction(journalTransactionInfo: any, businessId: string) {
        try {
            let parsedJournalTransactions: any = [];
            let length = journalTransactionInfo.Items.length || 0;
            console.log('length', length);
            if (journalTransactionInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    const journalTransaction = journalTransactionInfo.Items[i];
                    parsedJournalTransactions.push(this.parse(journalTransaction, businessId))
                }                
                return parsedJournalTransactions;
            }
            else {
                 return parsedJournalTransactions;
                //logger.info("No Customers")
            }
        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseAccountsError)
        }
    }
    /**
     * Parse the Customer
     * @param account 
     * @param businessId 
     */
    parse(journalTransaction: any, businessId: string) {
       
        let parseData = {
            "businessId" : businessId,
            "journalDate" : '2021-02-02', //journalTransaction.DatePosted
            "transactionId" :  journalTransaction.UID,
            "transactionType" : journalTransaction.Lines !== null ? journalTransaction.Lines.SourceTransaction.TransactionType : 'CashPayment',
            "number" :  1, //hardcoded
            "contactId" : 'hhh', //hardcoded,
            "description" : journalTransaction.Description !== undefined ? journalTransaction.Description : 'description',
            "accountId" : journalTransaction.Lines.Account.UID !== undefined ? journalTransaction.Lines.Account.UID : 1,
            "amount" : journalTransaction.Lines.Amount !== undefined ? journalTransaction.Lines.Amount : 1,
            "isReconciled" :  true,
        }
        return parseData;
    }
}