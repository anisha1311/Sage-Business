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
            supplierPaymentDate = dateFormat(supplierPayment.Date, "yyyy-mm-dd");
        }
        let parseData = {
            "businessId" : businessId,
            "transactionId" : supplierPayment.TransactionUID !== undefined ? supplierPayment.TransactionUID+'' : '1', //hardcoded
            "paymentId" : supplierPayment.UID !== null ? supplierPayment.UID : '1', //hardcoded,
            "paidDate" :  supplierPaymentDate ,        //supplierPayment.Date ||
            "active" :  true,
            "transactionType" :  supplierPayment.Lines.Type !== undefined ? supplierPayment.Lines.Type : 'Bill',
            "refNumber" : supplierPayment.PaymentNumber !== null ? supplierPayment.PaymentNumber : '', //hardcoded
            "contactId" : supplierPayment.Supplier!== null ? supplierPayment.Supplier.UID : '',
            "bankId" : '', //hardcoded,
            "amount" : supplierPayment.AmountPaid !== null || supplierPayment.AmountPaid !== '' ? supplierPayment.AmountPaid : 0,
        }   
        return parseData;
    }
}