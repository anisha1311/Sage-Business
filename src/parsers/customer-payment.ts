import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
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
            console.log('length', length);
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
        let parseData = {
            "businessId" : businessId,
            "amount" : customerPayment.AmountReceived || 0,
            "transactionId" :  customerPayment.TransactionUID || '1', //hardcoded
            "transactionType" :  'Invoice',
            "refNumber" :  customerPayment.ReceiptNumber || '1', //hardcoded
            "paymentId" :  customerPayment.UID  || '1', //hardcoded,
            "paidDate" :   '01-09-2021',        //customerPayment.Date ||
            "contactId" : customerPayment.Customer!== null ? customerPayment.Customer.UID : '',
            "bankId" : '1', //hardcoded,
            "active" :  true,
        }

        return parseData;
    }

  
}



