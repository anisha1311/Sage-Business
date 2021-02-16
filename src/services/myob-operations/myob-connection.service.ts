import { HTTPService } from '@shared/http-service';
import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import axios from 'axios';
import qs from 'qs';
const httpService = new HTTPService()
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
	
}
