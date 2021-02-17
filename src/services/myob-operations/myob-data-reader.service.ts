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
        console.log('**********getCompanyInfo***********')
        try {
            let url = Constant.urlConstant.myobUrl.accountRight;
            console.log('url--', url);
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
        console.log('**********getAllCustomers***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.customerUrl, [companyId, startDate]); //, endDate
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            if (response) {        
               return response;
            }
            else {
                console.log(response);
                return response;
               throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            throw error
        }
    }

    async getAllSuppliers(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllSuppliers***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
                  
            if (response) {
                
               return response;
            }
            else {
                console.log('supplier response data reader ::: else ::: ' );
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('supplier response data reader ::: catch ::: ' );
            throw error
        }
    }

    async getAllPersonals(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllPersonals***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.personalUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllEmployees(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllEmployees***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.employeeUrl, [companyId, startDate]); //, endDate
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllAccounts(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllAccounts***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.accountUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllItems(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllItems***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.itemUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }
    
    async getAllInvoices(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllInvoices***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.invoiceUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    async getAllBills(token: string, companyId: string, startDate:string): Promise<any> {
        
        console.log('**********getAllBills***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.billUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

    
    async getAllCustomerPayments(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllCustomerPayments***********')
        try {
            let url =  stringFormat(Constant.urlConstant.myobUrl.customerPaymentUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }

      
    async getAllSupplierPayments(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllSupplierPayments***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorPaymentUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
            throw error
        }
    }


    async getAllJournalTransactions(token: string, companyId: string, startDate:string): Promise<any> {
        console.log('**********getAllJournalTransactions***********')
        try {
            let url = stringFormat(Constant.urlConstant.myobUrl.journalUrl, [companyId, startDate]);
            console.log('url--', url);
            // Make myob api call
            let response:any = await this.makeApiCall(url, token);
            
            if (response) {
               return response;
            }
            else {
                throw new Error(Constant.myobDataGetFailError.failedCompanyPrefrence)
            }
        } catch (error) {
            console.log('error', error);
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
                
                console.log('error process.env.MYOB_API_URL');
                throw new Error("MYOB API URL NOT DEFINED");
            }
                
            } catch (error) {
                console.log('error makeApiCall: ' + error);
            }
      
    }
}
