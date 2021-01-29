import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class VendorParser {
    /**
     * will parse the Customers
     * @param vendorInfo 
     * @param businessId 
     */
     public parseVendor(vendorInfo: any, businessId: string) {
        try {
            let parsedCustomers: any = [];
            let length = vendorInfo.Items.length || 0;
            console.log('length', length);
            if (vendorInfo && length > 0) {
                let parsedCustomers: any = [];
                for (let i = 0; i < length; i++) {
                    const vendor = vendorInfo.Items[i];
                    parsedCustomers.push(this.parse(vendor, businessId))
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
     * Parse the COA
     * @param account 
     * @param businessId 
     */
    parse(vendor: any, businessId: string) {
        let parseData = {

            "businessId" : businessId,
            "contactName" : vendor.CompanyName,    
            "isSupplier" : 'true',
            "isCustomer" : 'false',
            "isEmployee" : 'false',
            "active" : vendor.IsActive,
            "platformContactId" : vendor.UID,
            "contactAddress" : [],
            "contactPhone" : [],
        }

        return parseData;
    }

  
}



