import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { MyobDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
import moment from 'moment';
var dateFormat = require('dateformat');
const myobDataReaderService = new MyobDataReaderService();
export class InvoiceBillParser {
    /**
     * will parse the invoices
     * @param invoiceInfo 
     * @param businessId 
     */
     async parseInvoiceBills(invoiceBillInfo: any, access_token: string, businessId: string) {
        try {
            let parsedInvoicesBills: any = [];
            let length = invoiceBillInfo.length || 0;
            if (invoiceBillInfo && length > 0) {
                //let parsedInvoices: any = [];
                for (let i = 0; i < length; i++) {
                    for(let invoiceIndex = 0;invoiceIndex < invoiceBillInfo[i].value.Items.length; invoiceIndex++){
                        let serviceURI = invoiceBillInfo[i].value.Items[invoiceIndex].URI;
                        let lineItems = await myobDataReaderService.getAllInvoiceItems(access_token,serviceURI);
                        const invoiceBill = invoiceBillInfo[i].value.Items[invoiceIndex];
                        parsedInvoicesBills.push(this.parse(invoiceBill, businessId, lineItems, invoiceBillInfo[i].label))
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
    parse(invoiceBill: any, businessId: string, lineItems: any, label:any) {
        let invoiceBillDate : any = '';
        let promiseDate : any = '';
        var lines: any = [];
        if(invoiceBill.Date !== null){
            invoiceBillDate = dateFormat(invoiceBill.Date, "yyyy-mm-dd");
        }
        if(invoiceBill.PromisedDate !==null && promiseDate !== undefined){
            promiseDate = dateFormat(invoiceBill.PromisedDate, "yyyy-mm-dd");
        }
        if(lineItems.Lines !== null) { 
            for (var i = 0; i<lineItems.Lines.length; i++) {
                var line: any = {};
                line['description'] = lineItems.Lines[i].Description !== null && lineItems.Lines[i].Description !== '' ? lineItems.Lines[i].Description : 'not allowed to be empty',
                line['itemId'] = ' ';               
                line['lineNumber'] =  lineItems.Lines[i].RowID !== null ? lineItems.Lines[i].RowID : ' ';    
                line['lineAmount'] = lineItems.Lines[i].Total;     
                line['quantity'] = lineItems.Lines[i].UnitCount;  
                line['accountCode'] =  lineItems.Lines[i].Account !== null ? lineItems.Lines[i].Account.DisplayID : ' '; 
                line['unitPrice'] = lineItems.Lines[i].UnitPrice;
                lines.push(line);
                
            }    
        }
           
        let parseData = {
            //'businessId': businessId,
            "number" : invoiceBill.Number,
            "date" : invoiceBillDate !== '' ? invoiceBillDate : moment(Date.now()).format('YYYY-MM-DD'), 
            "dueDate" : promiseDate !== null ? promiseDate : moment(Date.now()).format('YYYY-MM-DD'),
            "trackingNo" :  ' ', 
            "totalLineItem" :  lines.length, 
            "lineAmountType" : '1',  //In ITS, It must be a number
            "amount" :  invoiceBill.TotalAmount,
            "balance" :  invoiceBill.BalanceDueAmount,
            "totalTax" : invoiceBill.TotalTax,
            "platformId" :  invoiceBill.UID ||  ' ',
            "type" : label == 'invoice'? '1' :'4',            
            "currency" : invoiceBill.ForeignCurrency || ' ',
            "lines" :  lines,
        }
        return parseData;
    }
}