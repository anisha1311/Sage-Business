import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class ContactParser {
    /**
     * will parse the Customers
     * @param customerInfo 
     * @param businessId 
     */
     public parseContact(contactInfo: any, businessId: string) {
        try {
            let parsedContacts: any = [];
            let length = contactInfo.length || 0;
            if (contactInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    for(let contactIndex = 0;contactIndex < contactInfo[i].value.Items.length; contactIndex++){
                        const customer = contactInfo[i].value.Items[contactIndex];
                        parsedContacts.push(this.parseData(customer, businessId, contactInfo[i].label))
                    }
                }                
                return parsedContacts;
            }
            else {
                 return parsedContacts;
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
    parseData(contact: any, businessId: string, label: any) {
        var contactAddresses : any = [];
        var contactPhones: any = [];
        let parseData: any = {};
        for (var i = 0; i<contact.Addresses.length; i++) {
            const contactAddress : any = {};
            const contactPhone : any = {};
            contactAddress['businessId'] = businessId,
            contactAddress['addressType'] =  1,
            contactAddress['addressLine1'] = contact.Addresses[i].Street !== ''? contact.Addresses[i].Street : ' ', 
            contactAddress['addressLine2'] = ' ',
            contactAddress['status'] = 1,
            contactAddress['city'] = contact.Addresses[i].City !== '' ? contact.Addresses[i].City :  ' ',
            contactAddress['postalCode']    = contact.Addresses[i].Postcode  !== '' ? contact.Addresses[i].Postcode :  ' ',
            contactAddress['state'] =  contact.Addresses[i].State !== '' ? contact.Addresses[i].State : ' ',
            contactAddress['country'] =  contact.Addresses[i].Country !== '' ? contact.Addresses[i].Country : ' ',
            contactAddresses.push(contactAddress);
            contactPhone['businessId'] = businessId,
            contactPhone['phoneType']    = 1, 
            contactPhone['phoneNumber'] = '1', //customer.Addresses[i] != null && customer.Addresses[i].Phone1 != null ? customer.Addresses[i].Phone1 +'': '1', 
            contactPhone['status'] = 1,        
            contactPhones.push(contactPhone);
        }
        parseData = {
            "businessId" : businessId,
            "contactName" : contact.IsIndividual !== false ? contact.FirstName + ' ' + contact.LastName : contact.CompanyName,    
            "isSupplier" : label== 'vendors'? 'true' : 'false',
            "isCustomer" : label== 'customer'? 'true' : 'false',
            "isEmployee" : label== 'employees'? 'true' : 'false',
            "active" : contact.IsActive,
            "platformContactId" : contact.UID,
            "contactAddress" : contactAddresses,
            "contactPhone" : contactPhones,
        }
        return parseData;
    }
}