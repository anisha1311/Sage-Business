import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
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
        let billDate : any;
        let promiseDate : any;
        var lines: any = [];
        if(bill.Date!==null){
            billDate = dateFormat(bill.Date, "yyyy-mm-dd");
        }
        if(bill.PromisedDate !==null){
            promiseDate = dateFormat(bill.PromisedDate, "yyyy-mm-dd")
        }
        for (var i = 0; i<bill.Lines.length; i++) {
            var line: any = {};
            line['description'] = bill.Lines[i].Description!== null? bill.Lines[i].Description:'description';       
            line['itemId'] = bill.Lines[i].Item !== null ? bill.Lines[i].Item.UID : '4567890';               
            line['lineNumber'] = bill.Lines[i].Item ? bill.Lines[i].Item.Number : 23;  
            line['accountCode'] = '1';
            line['lineAmount'] = bill.Lines[i].CostOfGoodsSold;     
            line['quantity'] = bill.Lines[i].ShipQuantity; 
            lines.push(line);
        }
        let parseData = {
            'businessId': businessId,
            "number" : bill.Number,
            "date" :  bill.billDate !== null || bill.billDate !== ''? billDate :'1944-10-12',  
            "dueDate" : bill.promiseDate !== null || bill.promiseDate !== ''? promiseDate : '1944-10-12',
            "shipDate" :  '1944-10-12', //hardcoded
            "trackingNo" :   12, //hardcoded
            "totalLineItem" :  1, //hardcoded
            "lineAmountType" : bill.Category !== null ? bill.Category : 'Bill' , //hardcoded
            "amount" :  bill.TotalAmount,
            "balance" :  bill.BalanceDueAmount,
            "totalTax" : bill.TotalTax,
            "platformId" :  bill.UID,
            "type" :  '2', ///NEED TO CHECK once again
            "contactID" : bill.Supplier!== null ?  bill.Supplier.UID : ' ', 
            "lines" :  lines,
            "currency" : bill.ForeignCurrency
        }
        return parseData;
    }
}