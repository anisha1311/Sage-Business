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

    async getAllCustomers(token: string, Uri: string): Promise<any> {
        console.log('**********getAllCustomers***********')
        try {
            let url = Uri+'/Contact/Customer';
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

    async getAllSuppliers(token: string, Uri: string): Promise<any> {
        console.log('**********getAllSuppliers***********')
        try {
            let url = Uri+'/Contact/Supplier';
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

    async getAllContacts(token: string, Uri: string): Promise<any> {
        console.log('**********getAllContacts***********')
        try {
            let url = Uri+'/Contact';
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

    async getAllEmployees(token: string, Uri: string): Promise<any> {
        console.log('**********getAllEmployees***********')
        try {
            let url = Uri+'/Contact/Employee';
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

    async getAllAccounts(token: string, Uri: string): Promise<any> {
        console.log('**********getAllAccounts***********')
        try {
            let url = Uri+'/GeneralLedger/Account';
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

    async getAllItems(token: string, Uri: string): Promise<any> {
        console.log('**********getAllItems***********')
        try {
            let url = Uri+'/Inventory/Item';
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
    
    async getAllInvoices(token: string, Uri: string): Promise<any> {
        console.log('**********getAllInvoices***********')
        try {
            let url = Uri+'/Sale/Invoice/Item';
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            console.log('response->>',response.data);
            
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

    async getAllBills(token: string, Uri: string): Promise<any> {
        console.log('**********getAllBills***********')
        try {
            let url = Uri+'/Purchase/Bill/Item';
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            console.log('response->>',response.data);
            
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

    
    async getAllCustomerPayments(token: string, Uri: string): Promise<any> {
        console.log('**********getAllCustomerPayments***********')
        try {
            let url = Uri+'/Sale/CustomerPayment';
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

      
    async getAllSupplierPayments(token: string, Uri: string): Promise<any> {
        console.log('**********getAllSupplierPayments***********')
        try {
            let url = Uri+'/Purchase/SupplierPayment';
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
