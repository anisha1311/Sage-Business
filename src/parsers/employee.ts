import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class EmployeeParser {

    /**
     * will parse the Customers
     * @param customerInfo 
     * @param businessId 
     */
     public parseEmployee(employeeInfo: any, businessId: string) {
        try {
            let parsedEmployees: any = [];
            let length = employeeInfo.Items.length || 0;
            console.log('length', length);
            if (employeeInfo && length > 0) {
                let parsedEmployees: any = [];
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
        let parseData = {

            "businessId" : businessId,
            "contactName" : employee.FirstName + ' ' + employee.LastName,    
            "isSupplier" : 'false',
            "isCustomer" : 'false',
            "isEmployee" : 'true',
            "active" : employee.IsActive,
            "platformContactId" : employee.UID,
            "contactAddress" : [],
            "contactPhone" : [],
        }

        return parseData;
    }

  
}



