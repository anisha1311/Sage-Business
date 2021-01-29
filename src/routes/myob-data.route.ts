import { Request, Response, Router } from 'express';
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } from 'http-status-codes';
import logger from '@shared/logger';
import { CommanAPIService } from '@shared/api-service';
import { ReloadBusinessParam } from 'src/requests/reload-business-request';
import { Constant } from '@shared/constants';
import { MonthlReloadService } from 'src/services/myob-operations/reload.service';

const apisvc = new CommanAPIService()
const reloadsbc = new MonthlReloadService()
const router = Router();

// MOST OF ROUTES HERE USED FOR TESTING PURPOSE. ONLY RELOAD SERVICE IS USED.

/**
 * @swagger
 * /api/qb/reload/{businessId}:
 *   post:
 *     tags:
 *     - "Reload Business Service"
 *     summary: To reload business data for a business
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
 *          name: businessId
 *          schema:
 *            type: string
 *          description: The Company platform ID
 */
router.post('/reload/:businessId', async (req: Request, res: Response) => {
    try {
        // Check if businessid is provided or not
        let reqParamsValidation = ReloadBusinessParam.validate(req.params)
        if (reqParamsValidation.error) {
            return res.status(BAD_REQUEST).json({ status: false, message: Constant.busResMsg.businessIdValidation, error: reqParamsValidation.error.details });
        }
        // Fetch the business details Based on businessid from business service
        let response = await apisvc.getBusinessDetails(req.params.businessId)
        // Sync date must be present in respose
        if (response && response.data.length > 0 && response.data[0].syncDate && response.data[0].businessPlateformId) {
            // Call reload service to relad the business data
            let reloadResponse = await reloadsbc.reloadCompany(response.data[0].syncDate, req.params.businessId, response.data[0].businessPlateformId,false)
            res.status(OK).json(reloadResponse)
        } else {
            res.status(BAD_REQUEST).json({
                stats: false,
                message: Constant.busResMsg.businessNotFound,
                error: null
            })
        }
    } catch (error) {
        try {
            logger.error("Error Reload:" + error)
            if (error.authResponse.json.error === Constant.qbDataGetFailError.invalidGrant) {
                return res.status(400).json({ error: {message:Constant.qbDataGetFailError.invalidGrant,isRefreshTokenExpired:true}, message: Constant.busResMsg.tokenExpiredOnReload, status: false })
            }
            if (error.response)
                return res.status(error.response.status || BAD_REQUEST).json({ status: false, error: error.response.data.error, message: error.response.data.message })
            else {
                throw new Error(Constant.busResMsg.failedReload)
            }
        } catch (error) {
            logger.error("Error Reload:Internal server error" + error)
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, error: error.response || error, message: Constant.commanResMsg.somethingWentWrong })
        }
    }
});



export default router;
