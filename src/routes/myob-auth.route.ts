import '../loadenv';
import { Request, Response, Router } from 'express';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { SmaiBusinessService } from 'src/services/myob-operations/smai.service';
import logger from '@shared/logger';
import { TimeZone } from '@shared/enums/comman-enum';
import { ConnectBusinessSchema } from 'src/requests/business-connect.request';
import { Constant } from '@shared/constants';
import { stringFormat } from '@shared/functions';
import { RefteshTokenSchema } from 'src/requests/refresh-token.request';
const myobConnectionService = new MyobConnectionService();
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
    
    const url = `${process.env.AUTH_BASE_URL}?client_id=${process.env.consumerKey}&redirect_uri=${process.env.redirect_uri}&response_type=${process.env.response_type}&scope=${process.env.scope}`;
    console.log('url', url);
    res.redirect(url);
    
   // return (url);

});


   /*     router.get('/', async (req: Request, res: Response) => {
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
                        const authUri = await myobConnectionService.getConnectURL();
                        res.redirect(authUri);
                    }

                
                  // return res.status(OK).json({ status: true, data: response, message: Constant.qbResMsg.connectionUrl });
                } catch (error) {
                return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error, message: Constant.commanResMsg.somethingWentWrong });
            }
        });*/

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
        console.log('login callback');
        
    try {

        const queryCode: string = req.query.code! as string;
        if (queryCode) {
            console.log('Get the queryCode Done!!!');
            let buff = Buffer.from(queryCode);
            const buffString:any = buff.toString('ascii');
            const code:any = buffString.replace(/\s+/g,'');
            console.log('Access_Code--', code);
            let response: any = await smaiBusinessService.saveBusiness(code);
        }


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
export default router;
