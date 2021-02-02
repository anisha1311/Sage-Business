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
                "accessToken": "asdf",
                "refreshToken": "asdf",
                "refreshTokenExpiresAt": "2012/12/12",
                "accessTokenExpireTime": "11234",
                "provider": "1234"
            }
            return parseData;
        } catch (error) {
            logger.error(error.stack || error.message);
            throw new Error(Constant.parserMsg.parseAccessTokenError)
        }
    }


}