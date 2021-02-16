import { getDateByAddingSeconds } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';

export class AccessTokenParser {
    /**
     * Parse access tokens
     * @param accessToken 
     */
    public static parseAccessTokens(accessToken: any) {
        try {
            let parseData = {
                "accessToken": accessToken.access_token,
                "refreshToken": accessToken.refresh_token,
                "refreshTokenExpiresAt": getDateByAddingSeconds(524600),
                "accessTokenExpireTime": getDateByAddingSeconds(accessToken.expires_in),
                'provider': 1
            }            
            return parseData;
        } catch (error) {
            logger.error(error.stack || error.message);
            throw new Error(Constant.parserMsg.parseAccessTokenError)
        }
    }


}