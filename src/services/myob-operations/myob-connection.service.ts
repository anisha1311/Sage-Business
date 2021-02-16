import { HTTPService } from '@shared/http-service';
import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';
import qs from 'qs';
const httpService = new HTTPService()
const OAuthClient = require('intuit-oauth');
const oauthClient = new OAuthClient({
	clientId: process.env.MYOB_CLIENT_ID,
	clientSecret: process.env.MYOB_RESPONSE_TYPE,
	environment: process.env.QUICKBOOK_CONNECTION_TYPE,
	redirectUri: process.env.QUICKBOOK_CALLBACK_URL,
});
const headervalues: any = {
	'Content-Type': 'application/x-www-form-urlencoded'
};
export class MyobConnectionService {
	
	/**
	 * will fetch Tokens on callback
	 * @param code 
	 */
	async getTokens(code: string): Promise<any> {
		var data = qs.stringify({
			'client_id': process.env.consumerKey,
			'client_secret': process.env.consumerSecret,
			'grant_type': process.env.grantType,
			'code': code,
			'redirect_uri': process.env.redirect_uri
		});
		
		let response = await httpService.post(Constant.urlConstant.myobUrl.getTokenUrl, data, headervalues);
		console.log(response);
		return response.data;
	}

	/**
	 * Will return new Tokens using refresh Tokens
	 * @param refreshToken // string
	 */
	async refreshTokensByRefreshToken(refreshToken: string): Promise<any> {
		var data = qs.stringify({
			'client_id': process.env.consumerKey,
			'client_secret': process.env.consumerSecret,
			'grant_type': 'refresh_token',
			'refresh_token': refreshToken
		});
		let response = await httpService.post(Constant.urlConstant.myobUrl.getTokenUrl, data, headervalues);
		return response.data;
	}
	/**
	 * Will disconnect the business from qb
	 * @param body request body
	 */
	async disconnectBusiness(realmId: any): Promise<any> {
		try {
			// let tokenResponse = await apisvc.getAccessToken('');
			// console.log(tokenResponse.data.accessToken);
			// let reqParams = {
			// 	token_type: 'bearer',
			// 	expires_in: 1,
			// 	refresh_token: tokenResponse.data.refreshToken,
			// 	x_refresh_token_expires_in: 1,
			// 	access_token: tokenResponse.data.accessToken,
			// };
			// return await oauthClient.revoke(reqParams);
		} catch (error) {
			logger.error('Reload service Failure: ' + error);
			let msg = Constant.qbResMsg.businessDisconnectFailed;
			if (error.authResponse && error.authResponse.json && error.authResponse.json.error &&
				error.authResponse.json.error === Constant.qbDataGetFailError.invalidGrant) {
				msg = error.authResponse.json.error;
			}
			return { error: error, message: msg, status: false };
		}
	}
}
