import { getDateGroupsBetweenTwoDays, stringFormat } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';


export class MyobDataReaderService {
    /**
     *  will return list of preferences
     * @param token
     */
    async getCompanyInfo(token: string): Promise<any> {  
        try {
            let url = Constant.urlConstant.myobUrl.accountRight;
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllCustomers(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.customerUrl, [companyId, startDate]); 
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            if (response) {        
               return response;
            }
            else {
                return response;
               throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllSuppliers(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
                  
            if (response) {
                
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllPersonals(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.personalUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllEmployees(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.employeeUrl, [companyId, startDate]); //, endDate
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllAccounts(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.accountUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllItems(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.itemUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }
    
    async getAllInvoices(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.invoiceUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllBills(token: string, companyId: string, startDate:string): Promise<any> {
        
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.billUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    
    async getAllCustomerPayments(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url =  stringFormat(Constant.urlConstant.myobUrl.customerPaymentUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

      
    async getAllSupplierPayments(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorPaymentUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }  


    async getAllJournalTransactions(token: string, companyId: string, startDate:string): Promise<any> {
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.journalUrl, [companyId, startDate]);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
               
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }




    /** Make Api Call */
    async makeApiCall(urlString: string, token:string): Promise<any> {
        try {
            if (process.env.MYOB_API_URL) {              
                
                return new Promise(function (resolve, reject) {
                    axios.get(urlString, {
                        headers: {
                            'x-myobapi-key': process.env.consumerKey,
                            'x-myobapi-version': 'v2',
                            'Accept-Encoding': 'gzip,deflate',
                            'Authorization': 'Bearer '+token
                        }
                    }			
                  )
                    .then( 
                        (response) => { 
                            var result = response.data; 
                            resolve(result); 
                        }, 
                        (error) => { 
                            var error = error.response.status;
                            resolve(error); 
                            } 
                        )                    
                    });  
            }
           
            else{
                
                throw new Error("MYOB API URL NOT DEFINED");
            }
                
            } catch (error) {
            }
      
    }
}
