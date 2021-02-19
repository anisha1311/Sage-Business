import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
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
        let invoiceDate : any;
        let promiseDate : any;
        var lines: any = [];
        if(invoice.Date !== null){
            invoiceDate = dateFormat(invoice.Date, "yyyy-mm-dd");
        }
        if(invoice.PromisedDate !==null){
            promiseDate = dateFormat(invoice.Date, "yyyy-mm-dd");
            console.log('invoice due date is->',promiseDate);
        }
        for (var i = 0; i<invoice.Lines.length; i++)
        {
            var line: any = {};
            line['description'] =  'description', //invoice.Lines[i].Description         
            line['itemId'] = invoice.Lines[i].Item !== null ? invoice.Lines[i].Item.UID : '23676236726';               
            line['lineNumber'] = '23' //invoice.Lines[i].Item !== null ? invoice.Lines[i].Item.Number : '23';  
            line['lineAmount'] = invoice.Lines[i].CostOfGoodsSold;     
            line['quantity'] = invoice.Lines[i].ShipQuantity;  
            line['accountCode'] = '1';
            console.log('promiseDate->',promiseDate)
            lines.push(line);
        }
        let parseData = {
            "number" : invoice.Number,
            "date" : invoiceDate !== null || invoiceDate !== '' ? invoiceDate : '1994-10-10', 
            "dueDate" : promiseDate !== undefined ? promiseDate : '2020-09-09',
            "shipDate" :  '1912-12-12', //hardcoded
            "trackingNo" :  ' ', //hardcoded
           // "contactID" :  invoice.Customer !== null ? invoice.Customer.UID+'' : '', 
            "totalLineItem" :  1, //hardcoded
            "lineAmountType" : 1, //hardcoded
            "amount" :  invoice.TotalAmount,
            "balance" :  invoice.BalanceDueAmount,
            "totalTax" : invoice.TotalTax,
            "platformId" :  invoice.UID !== null ? invoice.UID :'123',
            "type" :  '1', ///NEED TO CHECK once again
            "lines" :  lines,
            "currency" : 'INR'
        }
        return parseData;
    }
}