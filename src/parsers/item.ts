import * as data from '../shared/data/chartofAccounts.json'
import * as subaccounttypesdata from '../shared/data/sub-account-types.json'
import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
import { ChartOfAccountKeys } from '@shared/enums/parser-enum';
export class ItemParser {

    /**
     * will parse the Customers
     * @param itemInfo 
     * @param businessId 
     */
     public parseItem(itemInfo: any, businessId: string) {
        try {
            let parsedItems: any = [];
            let length = itemInfo.Items.length || 0;
            console.log('length', length);
            if (itemInfo && length > 0) {
                let parsedCustomers: any = [];
                for (let i = 0; i < length; i++) {
                    const item = itemInfo.Items[i];
                    parsedItems.push(this.parse(item, businessId))
                }                
                return parsedItems;
            }
            else {
                 return parsedItems;
                //logger.info("No Customers")
            }
        } catch (error) {
            logger.error(error.stack || error.message)
            throw new Error(Constant.parserMsg.parseAccountsError)
        }
    }

    /**
     * Parse the Customer
     * @param account 
     * @param businessId 
     */
    parse(item: any, businessId: string) {
        let parseData = {
            "businessId" : businessId,
            "platformId" : item.UID,
            "name" :  item.Name,
            "type" :  ' ',
            "fullName" :  item.Name,
            "salePrice" :  item.BaseSellingPrice || 1, //hardcoded
            "purchasePrice" :  item.LastPurchasePrice || 1, //hardcoded
            "isSold" :  item.IsSold,
            "isPurchased" :  item.IsBought,
            "incomeAccRefId" :  item.IncomeAccount !== null ? item.IncomeAccount.UID : '1', //hardcoded
            "expenseAccRefId" :  item.ExpenseAccount !== null ? item.ExpenseAccount.UID : '1', //hardcoded
        }

        return parseData;
    }

  
}



