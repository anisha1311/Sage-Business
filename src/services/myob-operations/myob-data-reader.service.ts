import { getDateGroupsBetweenTwoDays, stringFormat } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';

const clientId =  process.env.MYOB_CLIENT_ID;
export class QuickbooksDataReaderService {
    /**
     *  will return list of preferences
     * @param token
     */
    async getCompanyInfo(token: string): Promise<any> {
        console.log('**********getCompanyInfo***********')
        try {
            let url = Constant.urlConstant.myobUrl.accountRight
            console.log('url--', url);
            // Make qbo api call
            let response:any = await this.makeApiCall(url, token);
            console.log('response--', response.data);
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
            throw error
        }
    }

    /** Make Api Call */
    makeApiCall(urlString: string, token:string) {
        console.log('token- ', token);
        try {
            if (process.env.MYOB_API_URL) {
                return axios({
                    url: urlString,
                    method: 'GET',
                    headers: {
                        'x-myobapi-key': 'k896h2eerjhm2h3gvghrpran',
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
