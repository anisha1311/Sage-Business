import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
import moment from 'moment';
var dateFormat = require('dateformat');
export class InvoiceBillParser {
    /**
     * will parse the invoices
     * @param invoiceInfo 
     * @param businessId 
     */
     public parseInvoiceBills(invoiceBillInfo: any, businessId: string) {
        try {
            let parsedInvoicesBills: any = [];
            let length = invoiceBillInfo.length || 0;
            if (invoiceBillInfo && length > 0) {
                //let parsedInvoices: any = [];
                for (let i = 0; i < length; i++) {
                    for(let invoiceIndex = 0;invoiceIndex < invoiceBillInfo[i].value.Items.length; invoiceIndex++){
                        const invoiceBill = invoiceBillInfo[i].value.Items[invoiceIndex];
                        parsedInvoicesBills.push(this.parse(invoiceBill, businessId, invoiceBillInfo[i].label))
                    }
                }                
                return parsedInvoicesBills;
            }
            else {
                 return parsedInvoicesBills;
                //logger.info("No invoices")
            }
        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseAccountsError)
        }
    }
    /**
     * Parse the invoiceBill
     * @param account 
     * @param businessId 
     */
    parse(invoiceBill: any, businessId: string, label:any) {
        let invoiceBillDate : any = '';
        let promiseDate : any = '';
        var lines: any = [];
        if(invoiceBill.Date !== null){
            invoiceBillDate = dateFormat(invoiceBill.Date, "yyyy-mm-dd");
        }
        if(invoiceBill.PromisedDate !==null && promiseDate !== undefined){
            promiseDate = dateFormat(invoiceBill.PromisedDate, "yyyy-mm-dd");
        }
        if(invoiceBill.Lines !== null) { 
            for (var i = 0; i<invoiceBill.Lines.length; i++) {
                var line: any = {};
                line['description'] = invoiceBill.Lines[i].Description !== null && invoiceBill.Lines[i].Description !== '' ? invoiceBill.Lines[i].Description : 'not allowed to be empty',
                line['itemId'] = invoiceBill.Lines[i].Item !== null ? invoiceBill.Lines[i].Item.UID : ' ';               
                line['lineNumber'] = i+1+'';
                line['lineAmount'] = invoiceBill.Lines[i].CostOfGoodsSold;     
                line['quantity'] = invoiceBill.Lines[i].ShipQuantity;  
                line['accountCode'] =  invoiceBill.Lines[i].Item !== null ? invoiceBill.Lines[i].Item.Number : ' '; 
                line['unitPrice'] = invoiceBill.Lines[i].UnitPrice;
                lines.push(line);
            }    
        }
           
        let parseData = {
            //'businessId': businessId,
            "number" : invoiceBill.Number,
            "date" : invoiceBillDate !== '' ? invoiceBillDate : moment(Date.now()).format('YYYY-MM-DD'), 
            "dueDate" : promiseDate !== '' ? promiseDate : moment(Date.now()).format('YYYY-MM-DD'),
            "trackingNo" :  ' ', 
            "totalLineItem" :  invoiceBill.Lines.length, 
            "lineAmountType" : '1',  //ITS must be a number
            "amount" :  invoiceBill.TotalAmount,
            "balance" :  invoiceBill.BalanceDueAmount,
            "totalTax" : invoiceBill.TotalTax,
            "platformId" :  invoiceBill.UID ||  ' ',
            "type" : label == 'invoiceBill'? '1' :'4',
            "lines" :  lines,
            "currency" : invoiceBill.ForeignCurrency || ' '
        }
        return parseData;
    }
}