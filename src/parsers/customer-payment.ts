import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
export class CustomerPaymentParser {
    /**
     * will parse the Customers
     * @param itemInfo 
     * @param businessId 
     */
     public parseCustomerPayment(customerPaymentInfo: any, businessId: string) {
        try {
            let parsedCustomerPayments: any = [];
            let length = customerPaymentInfo.Items.length || 0;
            if (customerPaymentInfo && length > 0) {
                let parsedCustomerPayment: any = [];
                for (let i = 0; i < length; i++) {
                    const customerPayment = customerPaymentInfo.Items[i];
                    parsedCustomerPayments.push(this.parse(customerPayment, businessId))
                }                
                return parsedCustomerPayments;
            }
            else {
                 return parsedCustomerPayments;
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
    parse(customerPayment: any, businessId: string) {
        let customerPaymentDate;
        if(customerPayment.Date !== null){
            customerPaymentDate = dateFormat(customerPayment.Date, "yyyy-mm-dd")
        }
        let parseData = {
            "businessId" : businessId,
            "transactionId" :  customerPayment.TransactionUID !== null ? customerPayment.TransactionUID : ' ',
            "paymentId" :  customerPayment.UID !== null ? customerPayment.UID : ' ', 
            "paidDate" :   customerPayment.Date !== null ? customerPaymentDate : '1994-10-13',
            "active" :  true,
            "transactionType" : 'Invoice', //customerPayment.Invoices.Type !== null ? customerPayment.Invoices.Type :
            "refNumber" :  customerPayment.ReceiptNumber !== null ?customerPayment.ReceiptNumber : ' ' ,
            "contactId" : customerPayment.Customer!== null ? customerPayment.Customer.UID : ' ',
            "bankId" : ' ',
            "amount" : customerPayment.AmountReceived !== null ? customerPayment.AmountReceived : ' ',
        }
        return parseData;
    }
}