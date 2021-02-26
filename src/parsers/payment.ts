import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
export class PaymentParser {
    /**
     * will parse the Customers
     * @param itemInfo 
     * @param businessId 
     */
     public parsePayment(PaymentInfo: any, businessId: string) {
        try {
            let parsedPayments: any = [];
            let length = PaymentInfo.length || 0;
            if (PaymentInfo && length > 0) {
                //let parsedCustomerPayment: any = [];
                for (let i = 0; i < length; i++) {
                    for(let paymentIndex = 0;paymentIndex < PaymentInfo[i].value.Items.length; paymentIndex++){
                        const payments = PaymentInfo[i].value.Items[paymentIndex];
                        parsedPayments.push(this.parse(payments, businessId, PaymentInfo[i].label))
                    }
                }                
                return parsedPayments;
            }
            else {
                 return parsedPayments;
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
    parse(payment: any, businessId: string, label:any) {
        let paymentDate;
        if(payment.Date !== null){
            paymentDate = dateFormat(payment.Date, "yyyy-mm-dd")
        }
        let parseData = {
            "businessId" : businessId,
            "transactionId" : '1', //customerPayment.TransactionUID !== null ? customerPayment.TransactionUID : '1', //hardcoded
            "paymentId" :  payment.UID !== null ? payment.UID : ' ', 
            "paidDate" :   payment.Date !== null ? paymentDate : '1994-10-13',
            "active" :  true,
            "transactionType" : label== 'customerPayments'? 'Invoice': 'Bill', //customerPayment.Invoices.Type !== null ? customerPayment.Invoices.Type :
            "refNumber" : label== 'customerPayments'? payment.ReceiptNumber !== null ?payment.ReceiptNumber : ' ' : payment.PaymentNumber !== null ? payment.PaymentNumber : '',
            "contactId" : label== 'customerPayments'? payment.Customer!== null ? payment.Customer.UID : ' ' : payment.Supplier!== null ? payment.Supplier.UID : '',
            "bankId" : ' ',
            "amount" : label== 'customerPayments'? payment.AmountReceived !== null ? payment.AmountReceived : ' ' : payment.AmountPaid !== null || payment.AmountPaid !== '' ? payment.AmountPaid : 0,
        }
        return parseData;
    }
}