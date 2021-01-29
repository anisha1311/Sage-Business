import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class ContactParser {
    /**
     * will parse the Customers
     * @param vendorInfo 
     * @param businessId 
     */
     public parseContact(contactInfo: any, businessId: string) {
        try {
            let parsedContacts: any = [];
            let length = contactInfo.Items.length || 0;
            console.log('length', length);
            if (contactInfo && length > 0) {
                let parsedContacts: any = [];
                for (let i = 0; i < length; i++) {
                    const contact = contactInfo.Items[i];
                    parsedContacts.push(this.parse(contact, businessId))
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
     * Parse the COA
     * @param account 
     * @param businessId 
     */
    parse(contact: any, businessId: string) {
        let parseData = {

            "businessId" : businessId,
            "contactName" : contact.FirstName + ' ' + contact.LastName,    
            "isSupplier" : 'false',
            "isCustomer" : 'false',
            "isEmployee" : 'false',
            "isIndividual" : 'true',
            "active" : contact.IsActive,
            "platformContactId" : contact.UID,
            "contactAddress" : [],
            "contactPhone" : [],
        }

        return parseData;
    }

  
}



