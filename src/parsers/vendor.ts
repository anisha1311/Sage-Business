import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class VendorParser {
    /**
     * will parse the Vendors
     * @param vendorInfo 
     * @param businessId 
     */
     public parseVendor(vendorInfo: any, businessId: string) {
        try {
            let parsedVendors: any = [];
            let length = vendorInfo.Items.length || 0;
            if (vendorInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    const vendor = vendorInfo.Items[i];                  
                    parsedVendors.push(this.parse(vendor, businessId))
                }                
                return parsedVendors;
            }
            else {
                 return parsedVendors;
                //logger.info("No Vendors")
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
            vendorAddress['addressLine1'] = vendor.Addresses[i].Street !== ''? vendor.Addresses[i].Street : ' ', //hard coded
            vendorAddress['addressLine2'] = ' ', //hard coded
            vendorAddress['status'] = 1,
            vendorAddress['city'] = vendor.Addresses[i].City !== '' ? vendor.Addresses[i].City :  ' ',
            vendorAddress['postalCode']    = vendor.Addresses[i].Postcode  !== '' ? vendor.Addresses[i].Postcode :  ' ',
            vendorAddress['state'] =  vendor.Addresses[i].State !== '' ? vendor.Addresses[i].State : ' ',
            vendorAddress['country'] =  vendor.Addresses[i].Country !== '' ? vendor.Addresses[i].Country : ' ',
            vendorAddresses.push(vendorAddress);
            vendorPhone['businessId'] = businessId,
            vendorPhone['phoneType']    = 1, //hard code
            vendorPhone['phoneNumber'] =  vendor.Addresses[i] != null && vendor.Addresses[i].Phone1 != null ? vendor.Addresses[i].Phone1 +'': '1', 
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