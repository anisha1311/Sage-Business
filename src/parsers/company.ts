import { getValueByKey } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';

export class CompanyParser {

    /**
    * 
    * @param companyInfo 
    * @param realmId 
    */
    public static parseCompany(companyInfo: any) {
        try {
            let parseData = {
                "businessName": " " , //companyInfo.Name !== null ? companyInfo.Name  : 
                "legalName": " ",
                "country":  " " , // companyInfo.Country !== null ? companyInfo.Country  : 
                "email": " ",
                "fiscalYearStartMonth": " ",
                "businessStartDate": "2012/12/12",
                "businessPlateformId": " ",
                "homeCurrency": "IND",
                "provider": 3,
                "leadId": " ",
                "website": "www.getpostman.com/oauth2/callback",
                "timezone": "IST"
            }
            return parseData;

        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseBusinessData)
        }
    }

    /**
    * 
    * @param companyInfo 
    */
    public static parseCompanyAddress(companyInfo: any) {
        try {
            let companyAdd: any = null;
            if (companyInfo){
                companyAdd = {
                    addressType: 3,
                    city: " ",
                    line1: " ",
                    postalCode: " ",
                    country: " "
                }
            }
            return companyAdd;

        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseBusinessData)
        }
    }
}