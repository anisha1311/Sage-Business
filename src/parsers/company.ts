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
                "Id": companyInfo.CompanyName,
                "Name": companyInfo.LegalName,
                "country": companyInfo.Country,
                "Uri": companyInfo.Email.Address
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
            if (companyInfo.CompanyAddr) {
                companyAdd = {
                    city: companyInfo.CompanyAddr.City ? companyInfo.CompanyAddr.City : '',
                    line1: companyInfo.CompanyAddr.Line1 ? companyInfo.CompanyAddr.Line1 : '',
                    postalCode: companyInfo.CompanyAddr.PostalCode ? companyInfo.CompanyAddr.PostalCode : '',
                    country: companyInfo.CompanyAddr.Country ? companyInfo.CompanyAddr.Country : ''
                }
            }
            return companyAdd;

        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseBusinessData)
        }
    }
}