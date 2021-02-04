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

        var vendorAddresses : any = [];
        var vendorPhones: any = [];
        for (var i = 0; i<vendor.Addresses.length; i++) {
            const vendorAddress : any = {};
            const vendorPhone : any = {};
            vendorAddress['businessId'] = businessId
            vendorAddress['addressType'] =  1,
            vendorAddress['addressLine1'] = vendor.Addresses[i].Street !== null && vendor.Addresses[i].Street !== ''? vendor.Addresses[i].Street : 'Street', //hard coded
            vendorAddress['addressLine2'] = " " || 'Line2', //hard coded
            vendorAddress['status'] = 1,
            vendorAddress['city'] = vendor.Addresses[i].City || 'City',
            vendorAddress['postalCode']    = vendor.Addresses[i].Postcode || 'Postcode',
            vendorAddress['state'] =  vendor.Addresses[i].State || 'State',
            vendorAddress['country'] =  vendor.Addresses[i].Country || 'Country',
            vendorAddresses.push(vendorAddress);

            vendorPhone['businessId'] = businessId,
            vendorPhone['phoneType']    = 1, //hard code
            vendorPhone['phoneNumber'] = '6375372026', //hard code vendor.Addresses[i].Phone1 != null ? vendor.Addresses[i].Phone1 : 
            vendorPhone['status'] = 1,        
            vendorPhones.push(vendorPhone);
        }

        let parseData = {
            "businessId" : businessId,
            "contactName" : vendor.IsIndividual !== false ? vendor.FirstName + ' ' + vendor.LastName : vendor.CompanyName,    
            "isSupplier" : 'true',
            "isCustomer" : 'false',
            "isEmployee" : 'false',
            "active" : vendor.IsActive,
            "platformContactId" : vendor.UID,
            "contactAddress" : vendorAddresses,
            "contactPhone" : vendorPhones,
        }

        return parseData;
    }

  
}

/**
 * 
 * 
    async parseAddress(address: any, businessId: string) {
        let parseData = {
            "addressType" : null,
            "addressLine1" : address.Street,
            "addressLine2" : null,
            "status" : null,
            "city" :  address.City,
            "postalCode" :  address.PostCode,
            "state" :  address.State,
            "country" :  address.Country,
            "businessId" : businessId,
        }
        return parseData;
    }

    async parsePhones(address: any, businessId: string) {
        let parseData = {
            "phoneType" : null,
            "phoneNumber" : address.Phone1,
            "phoneCountryCode" : null,
            "status" : null,
            "businessId" : businessId,
        }
        return parseData;
    }

 */


