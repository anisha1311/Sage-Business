import '../loadenv';
import { Request, Response, Router } from 'express';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import { QuickbooksConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { SmaiBusinessService } from 'src/services/myob-operations/smai.service';
import logger from '@shared/logger';
import { TimeZone } from '@shared/enums/comman-enum';
import { ConnectBusinessSchema } from 'src/requests/business-connect.request';
import { Constant } from '@shared/constants';
import { stringFormat } from '@shared/functions';
import { RefteshTokenSchema } from 'src/requests/refresh-token.request';
const quickbookConnectionService = new QuickbooksConnectionService();
const smaiBusinessService = new SmaiBusinessService();
const router = Router();

/**
 * @swagger
 * /api/qb/connection-url:
 *   get:
 *     tags:
 *     - "Quickbooks"
 *     summary: Returns redirect url
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           data:
 *            type: object
 *            description: result for request.
 *       400:
 *         description: Bad Request
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           error:
 *            type: object
 *            description: any error.
 */
        router.get('/', async (req: Request, res: Response) => {
        // router.get('/connection-url', async (req: Request, res: Response) => {
            
                try {
                    let timezone = TimeZone.default;
                    // To get connection url from myob

                    if( smaiBusinessService.access_token && smaiBusinessService.refresh_token)
                    {
                        console.log('Have AccessToken and Refresh Token ');
                        let response = await smaiBusinessService.saveBusiness('false', smaiBusinessService.access_token , smaiBusinessService.refresh_token, timezone);
                    }
                    else
                    {
                        console.log('herekrjk');
                        
                        const authUri = await quickbookConnectionService.getConnectURL();
                        res.redirect(authUri);
                    }

                
                  //  return res.status(OK).json({ status: true, data: response, message: Constant.qbResMsg.connectionUrl });
                } catch (error) {
                return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error, message: Constant.commanResMsg.somethingWentWrong });
            }
        });

/*
 * @swagger
 * /api/qb/callback:
 *   get:
 *     tags:
 *     - "Quickbooks"
 *     summary: Callback url called by qb on company Connect
 *     produces:
 *      - application/json
 *     parameters:
 *        - in: query
 *          name: code
 *          schema:
 *            type: string
 *            description: code
 *        - in: query
 *          name: state
 *          schema:
 *            type: string
 *            description: state
 *        - in: query
 *          name: realmId
 *          schema:
 *            type: string
 *            description: realmId
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *            description: userId
 *        - in: query
 *          name: timezone
 *          schema:
 *            type: string
 *            description: timezone
 *     responses:
 *       200:
 *         description: success
 *         schema: 
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           data:
 *            type: object
 *            description: result for request.
 *       400:
 *         description: Bad Request
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           error:
 *            type: object
 *            description: any error.
 */
router.get('/login/callback', async (req: Request, res: Response) => {
    //router.get('/callback', async (req: Request, res: Response) => {
    try {
        // Validate the request model
        let validationResponse = ConnectBusinessSchema.validate(req.query);
        if (validationResponse.error) {
            return res.status(BAD_REQUEST).json({ status: false, message: Constant.commanResMsg.modelInvalid, error: validationResponse.error.message });
        }
        let timezone = TimeZone.default;
        // Prepare the callback string url
        const code:any = req.query.code;
        let buff = Buffer.from(code);
        const buffString:any = buff.toString('ascii');
        const callbackString:any = buffString.replace(/\s+/g,'');
        console.log('Access_Code--', callbackString);
        //let response:any = '';
        if(callbackString) {
          let response = await smaiBusinessService.saveBusiness(callbackString,'false','false', timezone);
        }
       //** const callbackString = stringFormat(Constant.urlConstant.QbUrl.callback, [req.query.state.toString(), req.query.code.toString()]);
       //** let timezone = TimeZone.default;
        // This function is for testing purpose so static id is passed as an argument intentionally. User id static for testing purpose
       //** let response = await smaiBusinessService.saveBusiness(callbackString, req.query.realmId.toString(), '5ec3c065576369c522453c0c', timezone);
        //let response = await smaiBusinessService.saveBusiness(callbackString);
       // res.status(OK).json(response);

    } catch (error) {
        try {
            logger.error(error);
            if (error.response) return res.status(error.response.status || BAD_REQUEST).json({ status: false, error: error.response.data.error, message: error.response.data.message });
            else {
                throw new Error(Constant.busResMsg.businessConnectFailed);
            }
        } catch (error) {
            logger.error(error);
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error.response || error, message: Constant.commanResMsg.somethingWentWrong });
        }
    }
});

/**
 * @swagger
 * /api/qb/connect-business:
 *   post:
 *     tags:
 *     - "Quickbooks"
 *     summary: connect-business to onboard new company
 *     parameters:
 *        - in: body
 *          name: companyConnect
 *          schema:
 *            type: object
 *            properties:
 *              code:
 *                type: string
 *              realmid:
 *                type: string
 *              state:
 *                type: string
 *              userId:
 *                type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           data:
 *            type: object
 *            description: result for request.
 *       400:
 *         description: Bad Request
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           error:
 *            type: object
 *            description: any error.
 */
router.post('/connect-business', async (req: Request, res: Response) => {
    try {
        // Validate the request
        let validationResponse = ConnectBusinessSchema.validate(req.body);
        if (validationResponse.error) {
            return res.status(BAD_REQUEST).json({ status: false, message: Constant.commanResMsg.modelInvalid, error: validationResponse.error.message });
        }
        // Prepare the callback string
        const callbackString = stringFormat(Constant.urlConstant.QbUrl.callback, [req.body.state.toString(), req.body.code.toString()]);
        // calling service to save business
       //** let response = await smaiBusinessService.saveBusiness(callbackString, req.body.realmId.toString(), req.body.userId.toString(), req.body.timezone.toString());
       //** res.status(OK).json(response);
    } catch (error) {
        try {
            logger.error('Unable to connect company:');
            console.log(error);
            console.log(JSON.stringify(error.response));
            if (error.response) return res.status(error.response.status || BAD_REQUEST).json({ status: false, error: error.response.data.error, message: error.response.data.message });
            else {
                throw new Error(Constant.busResMsg.businessConnectFailed);
            }
        } catch (error) {
            logger.error('Unable to connect company:Internal server error' + error);
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error.response || error, message: Constant.commanResMsg.somethingWentWrong });
        }
    }
});

/**
 * @swagger
 * /api/qb/refresh-token/{refreshToken}:
 *   get:
 *     tags:
 *     - "Quickbooks"
 *     summary: To get access token from refesh token
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           data:
 *            type: object
 *            description: result for request.
 *       400:
 *         description: Bad Request
 *         schema:
 *          type: object
 *          properties:
 *           status:
 *            type: boolean
 *            description: status.
 *           message:
 *            type: string
 *            description: success message.
 *           error:
 *            type: object
 *            description: any error.
 *     parameters:
 *        - in: path
 *          name: refreshToken
 *          schema:
 *            type: string
 *          description: pass the Refresh Token
 */
router.get('/refresh-token/:refreshToken', async (req: Request, res: Response) => {
    try {
        // Validate the request
        let validationResponse = RefteshTokenSchema.validate(req.params);
        if (validationResponse.error) {
            return res.status(BAD_REQUEST).json({ status: false, message: Constant.commanResMsg.modelInvalid, error: validationResponse.error.message });
        }
        const quickbookService = new QuickbooksConnectionService();
        // To get access token from refresh token
        const accessToken = await quickbookService.refreshTokensByRefreshToken(req.params.refreshToken);
        return res.status(OK).json({ status: true, data: accessToken.token, message: Constant.busResMsg.createRefreshToken });
    } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error, message: Constant.commanResMsg.somethingWentWrong });
    }
});
export default router;
