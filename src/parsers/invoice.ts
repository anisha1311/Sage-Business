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
        let invoiceDate : any;
        let promiseDate : any;
        var lines: any = [];
        if(invoice.Date!==null){
            invoiceDate = invoice.Date.split('-');
        }
        if(invoice.PromisedDate !==null){
            promiseDate = invoice.PromisedDate.split('-');
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
            lines.push(line);
        }

        let parseData = {
            "number" : invoice.Number,
            "date" : '01-09-2021',//invoiceDate[1]+'-' + invoiceDate[2].substring(0,2) + '-' + invoiceDate[0], 
            "dueDate" : '01-09-2021',// promiseDate,
            "shipDate" :  '01-09-2021', //hardcoded
            "trackingNo" :  '23456789', //hardcoded
           // "contactID" :  invoice.Customer !== null ? invoice.Customer.UID : '', 
            "totalLineItem" :  '2', //hardcoded
            "lineAmountType" :  '2', //hardcoded
            "amount" :  invoice.TotalAmount,
            "balance" :  invoice.BalanceDueAmount,
            "totalTax" : invoice.TotalTax,
            "platformId" :  invoice.UID || '2343564',
            "type" :  '1', ///NEED TO CHECK once again
            "lines" :  lines,
        }

        return parseData;
    }

  
}



