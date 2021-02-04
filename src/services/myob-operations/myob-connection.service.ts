import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';
import qs from 'qs';

const OAuthClient = require('intuit-oauth');
const oauthClient = new OAuthClient({
	clientId: process.env.MYOB_CLIENT_ID,
	clientSecret: process.env.MYOB_RESPONSE_TYPE,
	environment: process.env.QUICKBOOK_CONNECTION_TYPE,
	redirectUri: process.env.QUICKBOOK_CALLBACK_URL,
});

const consumerKey = process.env.MYOB_CLIENT_ID;
const response_type = process.env.MYOB_RESPONSE_TYPE;
const grant_type = process.env.MYOB_GRANT_TYPE;
const redirect_uri = process.env.MYOB_CALLBACK_URL;
const scope = process.env.MYOB_SCOPE;
const client_secret = process.env.MYOB_CLIENT_SECRETE;
const authorizationUrl = process.env.authorizationUrl;
let apisvc = new CommanAPIService();
const headervalues :any = { 
	'Content-Type': 'application/x-www-form-urlencoded'
  };
export class MyobConnectionService {
	/**
	 * Will generate Url for Same
	 */
	async getConnectURL(): Promise<string> {
		let url =`https://secure.myob.com/oauth2/account/authorize?client_id=${consumerKey}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}`;
		return url;
	}

	/**
	 * will fetch Tokens on callback
	 * @param callbackString 
	 */
	async getTokens(callbackString: string): Promise<any> {
		var data = qs.stringify({
			'client_id': consumerKey,
			'client_secret': client_secret,
			'grant_type': grant_type,
			'code': callbackString,
			'redirect_uri': redirect_uri
		  });
		  console.log('data', data);
		return new Promise(function (resolve, reject) {
			axios.post('https://secure.myob.com/oauth2/v1/authorize/',data, headervalues			
		  )
			.then( 
				(response) => { 
					  var result = response.data; 
					  console.log('result', result)
					 
					  resolve(result); 
							  }, 
					  (error) => { 
						  console.log('error', error);
						var data = {
						  access_token : '',
						  refresh_token : '',
						  success: false
						}
						resolve(data); 
					  //reject(error); 
					} 
				)                    
			});
	}

	/**
	 * Will return new Tokens using refresh Tokens
	 * @param refreshToken // string
	 */
	async refreshTokensByRefreshToken(refreshToken: string): Promise<any> {
		console.log('refreshTokensByRefreshToken');
		
		var data = qs.stringify({
			'client_id': consumerKey,
			'client_secret': client_secret,
			'grant_type': 'refresh_token',
			'refresh_token': refreshToken
		  });
		  console.log('data', data);
		return new Promise(function (resolve, reject) {
			axios.post('https://secure.myob.com/oauth2/v1/authorize/',data, headervalues			
		  )
			.then( 
				(response) => { 
					  var result = response.data; 
					  console.log('result', result)
					  var data = {
						access_token : result.access_token,
						refresh_token : result.refresh_token,
						success: true
					  }
					  resolve(data); 
							  }, 
					  (error) => { 
						  console.log('error', error);
						var data = {
						  access_token : '',
						  refresh_token : '',
						  success: false
						}
						resolve(data); 
					  //reject(error); 
					} 
				)                    
			});
	}
	/**
	 * Will disconnect the business from qb
	 * @param body request body
	 */
	async disconnectBusiness(realmId: any): Promise<any> {
		try {
			let tokenResponse = await apisvc.getAccessToken('');
			console.log(tokenResponse.data.accessToken);
			let reqParams = {
				token_type: 'bearer',
				expires_in: 1,
				refresh_token: tokenResponse.data.refreshToken,
				x_refresh_token_expires_in: 1,
				access_token: tokenResponse.data.accessToken,
			};
			return await oauthClient.revoke(reqParams);
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
