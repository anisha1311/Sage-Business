import * as _ from 'lodash'
import logger from '@shared/logger';
import { Constant } from '@shared/constants';
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
            "name" :  item.Name || ' ',
            "type" :  ' ',
            "fullName" :  item.Name || ' ',
            "salePrice" : item.SellingDetails != null ? item.SellingDetails.BaseSellingPrice != null ? item.SellingDetails.BaseSellingPrice : 0 : 0, 
            "purchasePrice" : item.BuyingDetails != null ? item.BuyingDetails.LastPurchasePrice != null ? item.BuyingDetails.LastPurchasePrice : 0 : 0, 
            "isSold" :  item.IsSold,
            "isPurchased" :  item.IsBought,
            "incomeAccRefId" :  item.IncomeAccount !== null ? item.IncomeAccount.UID : ' ', 
            "expenseAccRefId" :  item.ExpenseAccount !== null ? item.ExpenseAccount.UID : ' ', 
        }
        return parseData;
    }
}