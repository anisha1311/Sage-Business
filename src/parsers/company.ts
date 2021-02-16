import { getValueByKey } from '@shared/functions';
import logger from '@shared/logger';
import { Constant } from '@shared/constants';

export class CompanyParser {

    /**
    * 
    * @param companyInfo 
    * @param realmId 
    */
    public static parseCompany(realmId: any,companyInfo: any) {
        try {
            let parseData = {
                "businessName": companyInfo.Name !== null && companyInfo.Name !== '' ? companyInfo.Name  : " " , 
                "legalName": companyInfo.LibraryPath !== null && companyInfo.LibraryPath !== '' ? companyInfo.LibraryPath  : " " , 
                "country": companyInfo.Country !== null  && companyInfo.Country !== '' ? companyInfo.Country  :  " " , 
                "email": " ",
                "fiscalYearStartMonth": "January",
                "businessStartDate": "2012-01-12",
                "businessPlateformId": realmId,
                "homeCurrency": companyInfo.Country !== null  && companyInfo.Country !== '' ? companyInfo.Country  :  " " , 
                "provider": 3,
                "leadId":  companyInfo.LauncherId !== null  &&  companyInfo.LauncherId !== '' ?  companyInfo.LauncherId  :  " " , 
                "website": companyInfo.Uri !== null  && companyInfo.Uri !== '' ? companyInfo.Uri  :  " " , 
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
            let addressParse=[];
            let companyAdd: any = null; 
            
            if (companyInfo){
                companyAdd = {
                    addressType: 1,
                    city: " ",
                    line1: " ",
                    postalCode: " ",
                    country: companyInfo.Country !== null  && companyInfo.Country !== '' ? companyInfo.Country  :  " " , 
                }
            }
            addressParse.push(companyAdd)
            return addressParse;

        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseBusinessData)
        }
    }
}