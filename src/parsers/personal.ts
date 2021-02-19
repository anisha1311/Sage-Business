import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class PersonalParser {
    /**
     * will parse the Customers
     * @param personalInfo 
     * @param businessId 
     */
     public parsePersonal(personalInfo: any, businessId: string) {
        try {
            let parsedPersonals: any = [];
            let length = personalInfo.Items.length || 0;
            if (personalInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    const personal = personalInfo.Items[i];
                    parsedPersonals.push(this.parseData(personal, businessId))
                }                
                return parsedPersonals;
            }
            else {
                 return parsedPersonals;
                //logger.info("No personals")
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
    parseData(personal: any, businessId: string) {
        var personalAddresses : any = [];
        var personalPhones: any = [];
        for (var i = 0; i<personal.Addresses.length; i++) {
            const personalAddress : any = {};
            const personalPhone : any = {};
            personalAddress['businessId'] = businessId
            personalAddress['addressType'] =  1,
            personalAddress['addressLine1'] = personal.Addresses[i].Street !== ''? personal.Addresses[i].Street : ' ', //hard coded
            personalAddress['addressLine2'] = ' ', //hard coded
            personalAddress['status'] = 1,
            personalAddress['city'] = personal.Addresses[i].City !== '' ? personal.Addresses[i].City :  ' ',
            personalAddress['postalCode']    = personal.Addresses[i].Postcode  !== '' ? personal.Addresses[i].Postcode :  ' ',
            personalAddress['state'] =  personal.Addresses[i].State !== '' ? personal.Addresses[i].State : ' ',
            personalAddress['country'] =  personal.Addresses[i].Country !== '' ? personal.Addresses[i].Country : ' ',
            personalAddresses.push(personalAddress);
            personalPhone['businessId'] = businessId,
            personalPhone['phoneType']    = 1, //hard code
            personalPhone['phoneNumber'] = personal.Addresses[i] != null && personal.Addresses[i].Phone1 != null ? personal.Addresses[i].Phone1 +'': '1', //hard code
            personalPhone['status'] = 1,        
            personalPhones.push(personalPhone);
        }
        let parseData = {
            "businessId" : businessId,
            "contactName" : personal.IsIndividual !== false ? personal.FirstName + ' ' + personal.LastName : personal.CompanyName,    
            "isSupplier" : 'false',
            "isCustomer" : 'false',  
            "isEmployee" : 'false',
            "active" : personal.IsActive,
            "platformContactId" : personal.UID,
            "contactAddress" : personalAddresses,
            "contactPhone" : personalPhones,
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