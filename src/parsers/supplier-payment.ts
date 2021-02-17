import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
var dateFormat = require('dateformat');
export class SupplierPaymentParser {
    /**
     * will parse the Suppliers
     * @param itemInfo 
     * @param businessId 
     */
     public parseSupplierPayment(supplierPaymentInfo: any, businessId: string) {
        try {
            let parsedSupplierPayments: any = [];
            let length = supplierPaymentInfo.Items.length || 0;
            console.log('length', length);
            if (supplierPaymentInfo && length > 0) {
                let parsedCustomers: any = [];
                for (let i = 0; i < length; i++) {
                    const supplierPayment = supplierPaymentInfo.Items[i];
                    parsedSupplierPayments.push(this.parse(supplierPayment, businessId))
                }                
                return parsedSupplierPayments;
            }
            else {
                 return parsedSupplierPayments;
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
    parse(supplierPayment: any, businessId: string) {
        let supplierPaymentDate;
        if(supplierPayment.Date !== null){
            supplierPaymentDate = dateFormat(supplierPayment.Date, "yyyy-mm-dd")
        }
        let parseData = {
            "businessId" : businessId,
            "amount" : supplierPayment.AmountPaid || 0,
            "transactionId" :  supplierPayment.TransactionUID || '1', //hardcoded
            "transactionType" : 'Bill', //supplierPayment.Lines !== null ? supplierPayment.Lines.Type : 
            "refNumber" :  supplierPayment.PaymentNumber || '1', //hardcoded
            "paymentId" :  supplierPayment.UID  || '1', //hardcoded,
            "paidDate" :  supplierPaymentDate ,        //supplierPayment.Date ||
            "contactId" : supplierPayment.Supplier!== null ? supplierPayment.Supplier.UID : '',
            "bankId" : '1', //hardcoded,
            "active" :  true,
        }   
        return parseData;
    }
}