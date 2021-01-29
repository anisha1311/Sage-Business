import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class CustomerParser {

    /**
     * will parse the Customers
     * @param customerInfo 
     * @param businessId 
     */
     public parseCustomer(customerInfo: any, businessId: string) {
        try {
            let parsedCustomers: any = [];
            let length = customerInfo.Items.length || 0;
            console.log('length', length);
            if (customerInfo && length > 0) {
                let parsedCustomers: any = [];
                for (let i = 0; i < length; i++) {
                    const customer = customerInfo.Items[i];
                    parsedCustomers.push(this.parse(customer, businessId))
                }                
                return parsedCustomers;
            }
            else {
                 return parsedCustomers;
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
    parse(customer: any, businessId: string) {
        let parseData = {

            "businessId" : businessId,
            "contactName" : customer.FirstName + ' ' + customer.LastName,    
            "isSupplier" : 'false',
            "isCustomer" : 'true',
            "isEmployee" : 'false',
            "active" : customer.IsActive,
            "platformContactId" : customer.UID,
            "contactAddress" : [],
            "contactPhone" : [],
        }

        return parseData;
    }

  
}



