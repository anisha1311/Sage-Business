import { HTTPService } from '@shared/http-service';
import logger from './logger';
import moment from 'moment';
import { stringFormat, addMonths } from './functions';
import { Constant } from './constants';
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
const myobConnectionService = new MyobConnectionService();
import { DateFormat, TimeUnitKeys } from './enums/comman-enum'
const OAuthClient = require('intuit-oauth');
const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOK_CLIENT_ID,
    clientSecret: process.env.QUICKBOOK_CONSUMERKEY,
    environment: process.env.QUICKBOOK_CONNECTION_TYPE,
    redirectUri: process.env.QUICKBOOK_CALLBACK_URL,
})
const httpService = new HTTPService()
import axios from 'axios';
import qs from 'qs';

const API_URL :any =  process.env.MYOB_API_URL;
const clientId = process.env.MYOB_CLIENT_ID;
const grant_type = process.env.MYOB_GRANT_TYPE_R;
const redirect_uri = process.env.MYOB_CALLBACK_URL;
const scope = process.env.MYOB_SCOPE;
const client_secret = process.env.MYOB_CLIENT_SECRETE;


export class CommanAPIService {
    // formatTokens(response: any, realmId: string) {
    //     throw new Error('Method not implemented.');
    // }

    async formatTokens(data: any, realmId: string) {
        console.log('format');
        
        let newtime = new Date().toISOString()
        let sbaccessTokenExpiryMinutes = (data.expires_in / 60)
        let sbrefreshTokenExpiryDays = (data.refresh_token_expires_in / (60 * 60 * 24))
        // Create new acesstoken expiry time and refresh token expiry time
        let newAccessTokenExpireTime = moment(newtime, DateFormat.dateTimeIso).add(sbaccessTokenExpiryMinutes, TimeUnitKeys.minutes).format(DateFormat.dateTime);
        let newRefreshTokenExpireTime = moment(newtime, DateFormat.dateTimeIso).add(sbrefreshTokenExpiryDays, TimeUnitKeys.days).format(DateFormat.dateTime);
        // Update the fetched response of token from smai-business-service
        data.refreshToken = data.refresh_token
        data.accessToken = data.access_token
        data.accessTokenExpireTime = newAccessTokenExpireTime;
        data.refreshTokenExpiresAt = newRefreshTokenExpireTime;
        let result = await this.updateTokenInsmaiBusinessService(data, realmId);
        //console.log('format token result*****', result);
        return result;

    }

    /**
     * To get Access token from smai-business-service
     * @param realmId
     */
    async getAccessToken(realmId: string) {

        let businessId = ""
        try {

            let accessTokenUrl: string = stringFormat(Constant.urlConstant.serviceUrl.accessTokenUrl, [realmId])
            
            let response = await httpService.get(accessTokenUrl);
            if (response.data && response.data.data && response.data.status === true) {

                let responsedata = response.data
                businessId = responsedata.data.id;
                let expiretime = responsedata.data.accessTokenExpireTime
                let currenttime = new Date().toISOString()
                // by how mucn minutes expire date ahead of current date                
                
                let minutes = moment(expiretime).diff(moment(currenttime, DateFormat.dateTimeIso), TimeUnitKeys.minutes);
                // if four minutes or less remaining for token to be expired then fetch the new token
                
                
                if (minutes <= Constant.commanConst.accessTokenLeastMinutes) {
                    // request for a new token from qb
                    console.log(responsedata.data.refreshToken);
                    
                    let tokenResponse = await this.refreshTokensByRefreshToken(responsedata.data.refreshToken)
                  
                    
                    if (tokenResponse.result && tokenResponse.result.access_token) {
                        let newtime = new Date().toISOString()
                        let qbaccessTokenExpiryMinutes = (tokenResponse.token.expires_in / 60)
                        let qbrefreshTokenExpiryDays = (tokenResponse.token.x_refresh_token_expires_in / (60 * 60 * 24))
                        // Create new acesstoken expiry time and refresh token expiry time
                        let newAccessTokenExpireTime = moment(newtime, DateFormat.dateTimeIso).add(qbaccessTokenExpiryMinutes, TimeUnitKeys.minutes).format(DateFormat.dateTime);
                        let newRefreshTokenExpireTime = moment(newtime, DateFormat.dateTimeIso).add(qbrefreshTokenExpiryDays, TimeUnitKeys.days).format(DateFormat.dateTime);
                        // Update the fetched response of token from smai-business-service
                        logger.info('new refresh token fetched: '+ tokenResponse.token.refresh_token + " businessId: " +businessId)
                        responsedata.data.refreshToken = tokenResponse.token.refresh_token
                        responsedata.data.accessToken = tokenResponse.token.access_token
                        responsedata.data.accessTokenExpireTime = newAccessTokenExpireTime
                        responsedata.data.expiresAt = newRefreshTokenExpireTime
                        // update access token on smai-business-service.
                        this.updateTokenInsmaiBusinessService(responsedata.data, realmId)
                    }
                }
            }
            return response.data

        } catch (error) {
            logger.error(error)
            // Mark status false if error is invalid grant
            // if (error.authResponse.json.error === 'invalid_grant') {
            //     this.markBusinessStaus(businessId, '0')
            // }
            throw error
        }
    }
    /**
     * Get the resource from qb.
     * @param urlString
     * @param accessToken
     */
    async getQBResource(urlString: string, accessToken: string) {
        
        
        if (process.env.MYOB_API_URL) {
            return axios({
                url: urlString,
                method: 'GET',
                headers: {
                    'x-myobapi-key': clientId,
                    'x-myobapi-version': 'v2',
                    'Accept-Encoding': 'gzip,deflate',
                    'Authorization': 'Bearer '+accessToken
                }
            })
        }
        else
            throw new Error("MYOB API URL NOT DEFINED");
    }

    /**
     * Get COA from smai Business service
     * @param realmId
     */
    async getCOA(realmId: string) {
        try {
            let url = stringFormat(Constant.urlConstant.serviceUrl.coaUrl, [realmId])
            let response = await httpService.get(url)
            return response.data

        } catch (error) {
            logger.error(error)
            throw error
        }
    }

    /**
     * Fetch new access token by refresh token
     * @param refreshToken
     */
    async refreshTokensByRefreshToken(refreshToken: string): Promise<any> {        
        let response = await myobConnectionService.refreshTokensByRefreshToken(refreshToken);
        return response;        
        
    }

    /**
     * To update the accesstoken into business-service
     * @param data
     */
    async updateTokenInsmaiBusinessService(data: any, realmId: string) {

        try {
            let requestBody = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                accessTokenExpireTime: data.accessTokenExpireTime,
                userId: data.userId,
                provider: data.provider,
                tokenId: data.id
            }
            console.log('Request data for token updation for business service ' + JSON.stringify(requestBody))
            let url = stringFormat(Constant.urlConstant.serviceUrl.credentialInfo, [realmId])
            console.log('url-- api service :::: ', url);
            
            // let response = await httpService.put(url, requestBody)
            // console.log('response in update token in smail', response);
            
            // if (response) {
            //     logger.info('New token updated on business-service')
            //     return response
            // }
        } catch (error) {
            logger.error('Error:updateTokenInBusinessService ' + error)
        }
    }

    /**
     * sync date of a business with smai-business-service
     * @param businessId
     * @param date
     */
    async syncDateWithBusinessService(businessId: string) {
        try {
            let currentdate = new Date().toISOString()
            let date = moment(currentdate, DateFormat.dateTimeIso).format(DateFormat.dateTime);
            let url = Constant.urlConstant.serviceUrl.syncDate
            let response = await httpService.post(url, { businessId, date })
            if (response) {
                logger.info('Date synced successfully ' + currentdate)
                return response
            }
        } catch (error) {
            logger.error('Unable to sync date ' + error)
        }

    }

    /**
     * To get business details by business id
     * @param businessId
     */
    async getBusinessDetails(businessId: string) {

        try {
            let url = stringFormat(Constant.urlConstant.serviceUrl.businessDetails, [businessId])
            let response = await httpService.get(url)
            if (response) {
                return response.data
            }

        } catch (error) {
            logger.error('getBusinessDetails Error:' + error)
            throw error
        }

    }

    /**
     * To get business details by business id
     * @param businessId
     */
    async getCDCData(url: string) {

        try {
            let response = await httpService.get(url)
            if (response) {
                return response.data
            }

        } catch (error) {
            logger.error('getCDCData Error:' + error)
            throw error
        }

    }


    /**
     * Mark status of business as 0 or 1
     * @param businessId 
     * @param status 
     */
    async markBusinessStaus(businessId: string, status: string) {

        try {
            let url = stringFormat(Constant.urlConstant.serviceUrl.markBusinessStatus, [businessId, status])
            let response = await httpService.patch(url, null)
            if (response) {
                logger.info('Staus marked as ' + status + ' for businessId ' + businessId)
            }
        } catch (error) {
            logger.error('markBusinessStaus Error ' + error)
        }
    }

    /**
    * Get Journal Entry data from QB for past year and six month ahead
    * @param realmId
    */
    async getJournalEntryData(realmId: string, timezone: string, accessToken: string, startDate: string, endDate: string) {
        try {

            let url = '' + process.env.QUICKBOOK_API_URL + '/v3/company/' + realmId + '/query?query=select * from JournalEntry Where Metadata.LastUpdatedTime>' + '\'' + startDate + '\'' + 'and Metadata.LastUpdatedTime<' + '\'' + endDate + '\'' + 'Order By Metadata.LastUpdatedTime&minorversion=47'
            let response = await this.getQBResource(url, accessToken)
            return response

        } catch (error) {
            logger.error(error)
            throw error
        }
    }


}