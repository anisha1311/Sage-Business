import logger from '@shared/logger';
import { reqHeaderCreator, stringFormat } from '@shared/functions';
import { SingleSignOn } from '@shared/enums/comman-enum';
import { Constant } from '@shared/constants';
import { HTTPService } from '@shared/http-service';

const OAuthClient = require('intuit-oauth');
const consumerKey = process.env.QUICKBOOK_CLIENT_ID;
const clientSecret = process.env.QUICKBOOK_CONSUMERKEY;
const oauthClient = new OAuthClient({
    clientId: consumerKey,
    clientSecret: clientSecret,
    environment: process.env.QUICKBOOK_CONNECTION_TYPE,
    redirectUri: process.env.REDIRECT_USER_URL,
});
const httpService = new HTTPService()
export class UserService {

    /* tslint:disable:no-empty */
    constructor() {
    }
    async getConnectURL(state: any): Promise<string> {
        let url = oauthClient.authorizeUri({
            scope: [OAuthClient.scopes.OpenId, OAuthClient.scopes.Profile, OAuthClient.scopes.Email],
            state: state,
        });
        return url;
    }

    async getUserInfo(token: string): Promise<any> {
        await oauthClient.setToken({ access_token: token });
        let tokens = await oauthClient.getUserInfo();
        return tokens.json;
    }

    async connectUser(requestType: any, code: string, keepMeLogin: boolean, state: any) {
        try {
            let resModel = { sub: '', email: '', firstName: '', state: 1, userInfo: null, lastName: '', responseFor: SingleSignOn.signIn, provider: 1 }
            const callbackString = stringFormat(Constant.urlConstant.QbUrl.callbackUser, [state, code]);
            // Get token based on code
            let tokenResponse: any = await this.getTokens(callbackString);
            let token: any = null;
            if (tokenResponse && tokenResponse.access_token) {
                token = tokenResponse.access_token;
                if (token) {
                    let userInfo = await this.getUserInfo(token);
                    if (userInfo) {
                        resModel.sub = userInfo.sub;
                        resModel.email = userInfo.email;
                        resModel.firstName = userInfo.givenName;
                        resModel.lastName = userInfo.familyName;
                        let model = {
                            sub: resModel.sub,
                            username: resModel.email,
                            keepMeLogin
                        }
                        let header = reqHeaderCreator();
                        let userData: any = null;
                        try {
                            userData = await httpService.post(Constant.urlConstant.serviceUrl.login, model, header);
                            if (userData && userData.data) {
                                let user = userData.data;
                                resModel.responseFor = SingleSignOn.signIn;
                                resModel.userInfo = user;
                                return {
                                    status: true,
                                    data: resModel,
                                    message: Constant.commanResMsg.successfullyFetchedData
                                };
                            }
                        } catch (error) {
                            if (error.response) {
                                if (error.response.data && error.response.data.error == null) {
                                    resModel.responseFor = SingleSignOn.signUp;
                                    return {
                                        status: true,
                                        data: resModel,
                                        message: Constant.commanResMsg.successfullyFetchedData
                                    };
                                }
                            }
                        }
                    }
                }
            }
            return {
                status: false,
                error: null,
                message: 'error'
            };
        } catch (error) {
            logger.error(error.message, error);
            return {
                status: false,
                error,
                message: 'error'
            };
        }
    }
    /**
    * will fetch Tokens on callback
    * @param callbackString
    */
    async getTokens(callbackString: string): Promise<any> {
        let tokens = await oauthClient.createToken(callbackString);
        return tokens.json;
    }
}