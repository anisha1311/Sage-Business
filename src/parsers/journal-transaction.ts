import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
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
            "journalDate" : dateFormat(journalTransaction.DateOccurred, "yyyy-mm-dd"),
            "transactionId" :  journalTransaction.UID,
            "transactionType" : journalTransaction.SourceTransaction !== null ? journalTransaction.SourceTransaction.TransactionType : ' ',
            "number" :  " ", //numbers coming in array in Lines items
            "contactId" : ' ', //display coming in array in Lines items
            "description" : ' ', //description coming in array in Lines items
            "accountId" : ' ', //accountIds coming in array in Lines items
            "amount" : '0', //amount coming in array in Lines items
            "isReconciled" : journalTransaction.ReconciledDate!= null ? true : false//amount coming in array in Lines items
        }
        return parseData;
    }
}