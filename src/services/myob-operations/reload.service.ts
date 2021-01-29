import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import moment from 'moment'
import * as _ from 'lodash';
import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';
import { ChartOfAccountParser } from 'src/parsers/account';
import { QueueDataHandler } from '@shared/queue-data-service';
let apisvc = new CommanAPIService()
import { stringFormat } from '@shared/functions';
import { Constant } from '@shared/constants';
import {  ReloadType } from '@shared/enums/comman-enum';
import { ReloadServiceKeys } from '@shared/enums/reload-enum';
export class MonthlReloadService {

    coa: any;
    /**
     * Reload the company based on the sync date of company
     * @param date 
     * @param businessId 
     * @param realmId 
     */
    async reloadCompany(date: string, businessId: string, realmId: string, isMonthlyReload: boolean) {
        try {

            // Convert date into required format
            let syncDate = moment(date, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]').subtract(2, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss-00:00');
            // Get access token
            let tokenResponse = await apisvc.getAccessToken(realmId)
            if (tokenResponse.data && tokenResponse.status === true) {
                console.log('Token data recieved')
                if (isMonthlyReload) {
                    let res = await this.verifyToken(tokenResponse.data.accessToken, realmId, syncDate)
                    if (res) {
                        let reloadDate = new Date().toISOString()
                        await this.reloadData(syncDate, tokenResponse, realmId, businessId, ReloadType.monthlyReload, reloadDate)
                    } else {
                        logger.info('verify token response was not json')
                        return false
                    }
                } else {
                    // Check if token is valid 
                    let res = await this.verifyToken(tokenResponse.data.accessToken, realmId, syncDate)
                    if (res) {
                        //start reloading entities
                        this.reloadData(syncDate, tokenResponse, realmId, businessId)
                    } else {
                        logger.info('verify token response was not json')
                        return { data: null, message: Constant.busResMsg.failedReload, status: false }
                    }
                }
                return { data: null, message: Constant.busResMsg.businessReload, status: true }
            } else {
                return { data: null, message: Constant.busResMsg.failedReload, status: false }
            }

        } catch (error) {
            logger.error("Reload service Failure: " + error)
            //return { error: error, message: Constant.busResMsg.failedReload, status: false }
            throw error
        }
    }


    async reloadData(syncDate: string, tokenResponse: any, realmId: string, businessId: string, reloadType?: ReloadType, monthlyReloadDate?: string) {

        // Fetch all entites & thier reports required for reloading a company
        await this.fetchCoa(syncDate, tokenResponse, realmId, businessId)
        //Update date on bsuiness service once reload done
        this.updateSyncDate(businessId)
    }

    /**
     * Fetch Customer,Vendor,Employee,Account from Qb CDC API
     * @param date 
     * @param tokenResponse 
     * @param realmId 
     * @param businessId 
     */
    async fetchCoa(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let accessToken = tokenResponse.data.accessToken
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.QbUrl.cdcCoa, [realmId, date])
            let response = await apisvc.getQBResource(url, accessToken)
            if (response.json) {
                // Check for expected response
                const isExist = _.has(response.json, 'CDCResponse[0].QueryResponse')
                if (isExist) {
                    let arr = response.json.CDCResponse[0].QueryResponse
                    // Filter COA
                    let arrCOA = _.filter(arr, ReloadServiceKeys.account);
                    if (arrCOA.length > 0) {
                        let parsedAccounts = new ChartOfAccountParser().parseChartofAccounts(arrCOA[0].Account, businessId);
                        QueueDataHandler.prepareAndSendQueueData(EntityType.webhookAccount, OperationType.REPLACE, businessId, parsedAccounts);
                        logger.info('      ')
                        logger.info('coa reloaded : BusinessId: ' + businessId)

                    }
                }
            }
        } catch (error) {
            logger.error(error)
        }
    }

    /**
     * Filter main array into date,txnid & items to delete
     * @param arr 
     * @param transarrr 
     * @param datesarr 
     * @param deleteArr 
     */
    filterDateTxnIds(arr: any, transarrr: any, datesarr: any, deleteArr: any) {

        arr.map((item: any) => {
            if (item.Id && !item.status) {
                transarrr.push(item.Id)
            }
            if (item.TxnDate && !item.status) {
                datesarr.push(item.TxnDate)
            }
            if (item.status && item.status === ReloadServiceKeys.deleted) {
                deleteArr.push(item.Id)
            }
        })
        return [transarrr, datesarr, deleteArr]
    }

    /**
     * Update the sync date on pp-business-service
     * @param businessId 
     */
    updateSyncDate(businessId: any) {
        if (businessId) {
            apisvc.syncDateWithBusinessService(businessId)
        }
    }
    /**
     * Verify if token can fetch data from qb
     * @param accessToken 
     * @param realmId 
     * @param date 
     */
    async verifyToken(accessToken: string, realmId: string, date: string) {
        try {
            let url = stringFormat(Constant.urlConstant.QbUrl.companyInfo, [realmId, date])
            let response = await apisvc.getQBResource(url, accessToken)
            // Check for expected response
            if (response.json) {
                return true
            }
            return false
        } catch (error) {
            logger.error(error)
            throw error
        }
    }
}