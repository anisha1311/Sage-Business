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
        let billDate : any;
        let promiseDate : any;
        var lines: any = [];
        if(bill.Date!==null){
            billDate = bill.Date.split('-');
        }
        if(bill.PromisedDate !==null){
            promiseDate = bill.PromisedDate.split('-');
        }

        for (var i = 0; i<bill.Lines.length; i++) {
            var line: any = {};
            line['description'] =  'description', // bill.Lines[i].Description          
            line['itemId'] = bill.Lines[i].Item !== null ? bill.Lines[i].Item.UID : '4567890';               
            line['lineNumber'] = '23'//bill.Lines[i].Item ? bill.Lines[i].Item.Number : 23;  
            line['lineAmount'] = bill.Lines[i].CostOfGoodsSold;     
            line['quantity'] = bill.Lines[i].ShipQuantity;  
            line['accountCode'] = '1';
            lines.push(line);
        }


        let parseData = {
            "number" : bill.Number,
            "date" :  '01-09-2021',//billDate[1]+'-' + billDate[2].substring(0,2) + '-' + billDate[0],  ,
            "dueDate" :  '01-09-2021',// promiseDate,
            "shipDate" :  '01-09-2021', //hardcoded
            "trackingNo" :   '23456789', //hardcoded
          //  "contactID" : bill.Supplier!== null ?  bill.Supplier.UID : '', 
            "totalLineItem" :  '2', //hardcoded
            "lineAmountType" :  '2', //hardcoded
            "amount" :  bill.TotalAmount,
            "balance" :  bill.BalanceDueAmount,
            "totalTax" : bill.TotalTax,
            "platformId" :  bill.UID,
            "type" :  '2', ///NEED TO CHECK once again
            "lines" :  lines
        }

        return parseData;
    }

  
}



