import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class EmployeeParser {
    /**
     * will parse the Employees
     * @param employeeInfo 
     * @param businessId 
     */
     public parseEmployee(employeeInfo: any, businessId: string) {  
        try {
            let parsedEmployees: any = [];
            let length = employeeInfo.Items.length || 0;
            if (employeeInfo && length > 0) {
                for (let i = 0; i < length; i++) {
                    const employee = employeeInfo.Items[i];               
                    parsedEmployees.push(this.parse(employee, businessId))
                }                
                return parsedEmployees;
            }
            else {
                 return parsedEmployees;
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
    parse(employee: any, businessId: string) {
        var employeeAddresses : any = [];
        var employeePhones: any = [];
        for (var i = 0; i<employee.Addresses.length; i++) {
            const employeeAddress : any = {};
            const employeePhone : any = {};
            employeeAddress['businessId'] = businessId
            employeeAddress['addressType'] =  1,
            employeeAddress['addressLine1'] = employee.Addresses[i].Street !== ''? employee.Addresses[i].Street : ' ', 
            employeeAddress['addressLine2'] = ' ', 
            employeeAddress['status'] = 1,
            employeeAddress['city'] = employee.Addresses[i].City !== '' ? employee.Addresses[i].City :  ' ',
            employeeAddress['postalCode']    = employee.Addresses[i].Postcode  !== '' ? employee.Addresses[i].Postcode :  ' ',
            employeeAddress['state'] =  employee.Addresses[i].State !== '' ? employee.Addresses[i].State : ' ',
            employeeAddress['country'] =  employee.Addresses[i].Country !== '' ? employee.Addresses[i].Country : ' ',
            employeeAddresses.push(employeeAddress);
            employeePhone['businessId'] = businessId,
            employeePhone['phoneType']    = 1, 
            employeePhone['phoneNumber'] =   '12', 
            employeePhone['status'] = 1,        
            employeePhones.push(employeePhone);
        }
        let parseData = {
            "businessId" : businessId,
            "contactName" : employee.IsIndividual !== false ? employee.FirstName + ' ' + employee.LastName : employee.CompanyName,    
            "isSupplier" : 'false',
            "isCustomer" : 'false',
            "isEmployee" : 'true',
            "active" : employee.IsActive,
            "platformContactId" : employee.UID,
            "contactAddress" : employeeAddresses,
            "contactPhone" : employeePhones,
        }
        return parseData;
    }
}
/*
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