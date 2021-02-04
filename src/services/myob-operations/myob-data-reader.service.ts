import { getDateGroupsBetweenTwoDays, stringFormat } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';

const clientId:any =  process.env.MYOB_CLIENT_ID;
const API_URL :any =  process.env.MYOB_API_URL;
export class MyobDataReaderService {
    /**
     *  will return list of preferences
     * @param token
     */
    async getCompanyInfo(token: string): Promise<any> {        
        console.log('**********getCompanyInfo***********')
        try {
            let url = Constant.urlConstant.myobUrl.accountRight;
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllCustomers(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllCustomers***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.customerUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            if (response) {
               return response.data;
            }
            else {
             //   throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllSuppliers(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllSuppliers***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllPersonals(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllPersonals***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.personalUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllEmployees(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllEmployees***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.employeeUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllAccounts(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllAccounts***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.accountUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllItems(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllItems***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.itemUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }
    
    async getAllInvoices(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllInvoices***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.invoiceUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllBills(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('STEP 2 getAllBills');
        
        console.log('**********getAllBills***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.billUrl, [companyId, startDate, endDate]);
            console.log('STEP 2 url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            console.log('STEP 2 response->>',response.data);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    
    async getAllCustomerPayments(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllCustomerPayments***********')
        try {
            let url =  stringFormat(Constant.urlConstant.myobUrl.customerPaymentUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

      
    async getAllSupplierPayments(token: string, companyId: string, startDate:string, endDate:string): Promise<any> {
        console.log('**********getAllSupplierPayments***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorPaymentUrl, [companyId, startDate, endDate]);
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response.data;
            }
            else {
                throw new Error(Constant.qbDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    /** Make Api Call */
    makeApiCall(urlString: string, token:string) {
        try {
            if (process.env.MYOB_API_URL) {
                return axios({
                    url: urlString,
                    method: 'GET',
                    headers: {
                        'x-myobapi-key': clientId,
                        'x-myobapi-version': 'v2',
                        'Accept-Encoding': 'gzip,deflate',
                        'Authorization': 'Bearer '+token
                    }
                })
            }
            else{
                console.log('error process.env.MYOB_API_URL');
                throw new Error("MYOB API URL NOT DEFINED");
            }
                
            } catch (error) {
                console.log('error makeApiCall: ' + error);
            }
      
    }
}
