import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class BillParser {

    /**
     * will parse the Customers
     * @param customerInfo 
     * @param businessId 
     */
     public parseBill(billInfo: any, businessId: string) {
        try {
            let parsedBills: any = [];
            let length = billInfo.Items.length || 0;
            console.log('length', length);
            if (billInfo && length > 0) {
                let parsedInvoices: any = [];
                for (let i = 0; i < length; i++) {
                    const bill = billInfo.Items[i];
                    parsedBills.push(this.parse(bill, businessId))
                }                
                return parsedBills;
            }
            else {
                 return parsedBills;
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
    parse(bill: any, businessId: string) {
        let parseData = {
            "number" : bill.Number,
            "date" : bill.Date,
            "dueDate" :  bill.PromisedDate,
            "shipDate" :  '',
            "trackingNo" :  '',
            "contactID" : bill.Customer!== null ?  bill.Customer.UID : '', 
            "totalLineItem" :  '',
            "lineAmountType" :  '',
            "amount" :  bill.TotalAmount,
            "balance" :  bill.BalanceDueAmount,
            "totalTax" : bill.TotalTax,
            "platformId" :  bill.UID,
            "type" :  '2', ///NEED TO CHECK once again
            "lines" :  '',
        }

        return parseData;
    }

  
}



