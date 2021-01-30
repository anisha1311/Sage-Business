import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class InvoiceParser {

    /**
     * will parse the Customers
     * @param customerInfo 
     * @param businessId 
     */
     public parseInvoice(invoiceInfo: any, businessId: string) {
        try {
            let parsedInvoices: any = [];
            let length = invoiceInfo.Items.length || 0;
            console.log('length', length);
            if (invoiceInfo && length > 0) {
                let parsedInvoices: any = [];
                for (let i = 0; i < length; i++) {
                    const invoice = invoiceInfo.Items[i];
                    parsedInvoices.push(this.parse(invoice, businessId))
                }                
                return parsedInvoices;
            }
            else {
                 return parsedInvoices;
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
    parse(invoice: any, businessId: string) {
        let parseData = {
            "number" : invoice.Number,
            "date" : invoice.Date,
            "dueDate" :  invoice.PromisedDate,
            "shipDate" :  '',
            "trackingNo" :  '',
            "contactID" :  invoice.Customer !== null ? invoice.Customer.UID : '', 
            "totalLineItem" :  '',
            "lineAmountType" :  '',
            "amount" :  invoice.TotalAmount,
            "balance" :  invoice.BalanceDueAmount,
            "totalTax" : invoice.TotalTax,
            "platformId" :  invoice.UID,
            "type" :  '1', ///NEED TO CHECK once again
            "lines" :  '',
        }

        return parseData;
    }

  
}



