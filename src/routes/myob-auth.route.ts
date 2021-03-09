import '../loadenv';
import { Request, Response, Router } from 'express';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import { SmaiBusinessService } from 'src/services/myob-operations/smai.service';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
const smaiBusinessService = new SmaiBusinessService();
const router = Router();

/**
 * @swagger
 * /api/myob/connection-url:
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
    res.redirect(url);
    
   // return (url);

});


/*
 * @swagger
 * /api/myob/callback:
 *   get:
 *     tags:
 *     - "Quickbooks"
 *     summary: Callback url called by myob on company Connect
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
       try {

        const queryCode: string = req.query.code! as string;
        if (queryCode) {
            let buff = Buffer.from(queryCode);
            const buffString:any = buff.toString('ascii');
            const code:any = buffString.replace(/\s+/g,'');
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
