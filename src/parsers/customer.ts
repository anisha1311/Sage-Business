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
                    // for(let j = 0; j < customer.Addresses.length; j++) {
                    //     const address = customer.Addresses[j];
                    //     console.log('address', address);
                        
                    //     parsedAddresses.push(this.parseAddress(address, businessId));     
                    //     console.log('parsedAddresses', parsedAddresses);
                                           
                    //     parsedphones.push(this.parsePhones(address, businessId));      
                    //     console.log('parsedphones', parsedphones);                  
                    // }
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
            customerAddress['businessId'] = businessId
            customerAddress['addressType'] =  1,
            customerAddress['addressLine1'] = customer.Addresses[i].Street !== null && customer.Addresses[i].Street !== ''? customer.Addresses[i].Street : 'Street', //hard coded
            customerAddress['addressLine2'] = " " || 'Line2', //hard coded
            customerAddress['status'] = 1,
            customerAddress['city'] = customer.Addresses[i].City || 'City',
            customerAddress['postalCode']    = customer.Addresses[i].Postcode || 'Postcode',
            customerAddress['state'] =  customer.Addresses[i].State || 'State',
            customerAddress['country'] =  customer.Addresses[i].Country || 'Country',
            customerAddresses.push(customerAddress);

            customerPhone['businessId'] = businessId,
            customerPhone['phoneType']    = 1, //hard code
            customerPhone['phoneNumber'] =  customer.Addresses[i].Phone1 != null ? customer.Addresses[i].Phone1 : '6375372026', //hard code
            customerPhone['status'] = 1,        
            customerPhones.push(customerPhone);
        }

        let parseData = {
            "businessId" : businessId,
            "contactName" : customer.FirstName + ' ' + customer.LastName,    
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





 /*   async parseAddress(address: any, businessId: string) {     
        let parseAdd = {
            'businessId':businessId ,    
            'addressType': " " || 'test',
            'addressLine1': address.Street !== null && address.Street !== ''? address.Street : 'Street', //hard coded
            'addressLine2': " " || 'Line2', //hard coded
            'status': 1,
            'city': address.City !== null ? address.City : 'City', //hard coded
            'postalCode': address.Postcode != null ? address.PostCode : 'PostCode', //hard coded
            'state': address.State != null ? address.State : 'State', //hard coded
            'country': address.Country != null ? address.Country :'Country', //hard coded   
        }
        console.log('parseAdd', parseAdd);
        return parseAdd;
    
    }

    async parsePhones(address: any, businessId: string) {
        let parsePhn = {
            'businessId':businessId ,    
            'phoneType': 1, //hard code
            'phoneNumber': address.Phone1 != null ? address.Phone1 : '6375372026', //hard code
            //'phoneCountryCode': null,
            'status': 1,           
        }
        console.log('parsePhn', parsePhn);    
        
    }*/
