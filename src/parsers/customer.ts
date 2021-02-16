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
            if (customerInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    const customer = customerInfo.Items[i];
                    parsedCustomers.push(this.parseData(customer, businessId))
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
    parseData(customer: any, businessId: string) {
        var customerAddresses : any = [];
        var customerPhones: any = [];
        for (var i = 0; i<customer.Addresses.length; i++) {
            const customerAddress : any = {};
            const customerPhone : any = {};
            customerAddress['businessId'] = businessId,
            customerAddress['addressType'] =  1,
            customerAddress['addressLine1'] = customer.Addresses[i].Street !== ''? customer.Addresses[i].Street : ' ', 
            customerAddress['addressLine2'] = ' ',
            customerAddress['status'] = 1,
            customerAddress['city'] = customer.Addresses[i].City !== '' ? customer.Addresses[i].City :  ' ',
            customerAddress['postalCode']    = customer.Addresses[i].Postcode  !== '' ? customer.Addresses[i].Postcode :  ' ',
            customerAddress['state'] =  customer.Addresses[i].State !== '' ? customer.Addresses[i].State : ' ',
            customerAddress['country'] =  customer.Addresses[i].Country !== '' ? customer.Addresses[i].Country : ' ',
            customerAddresses.push(customerAddress);
            customerPhone['businessId'] = businessId,
            customerPhone['phoneType']    = 1, 
            customerPhone['phoneNumber'] =  customer.Addresses[i] != '' || customer.Addresses[i] != null ? customer.Addresses[i].Phone1 + '' : '1', 
            customerPhone['status'] = 1,        
            customerPhones.push(customerPhone);
        }
        let parseData = {
            "businessId" : businessId,
            "contactName" : customer.IsIndividual !== false ? customer.FirstName + ' ' + customer.LastName : customer.CompanyName,    
            "isSupplier" : 'false',
            "isCustomer" : 'true',
            "isEmployee" : 'false',
            "active" : customer.IsActive,
            "platformContactId" : customer.UID,
            "contactAddress" : customerAddresses,
            "contactPhone" : customerPhones,
        }
        return parseData;
    }
}