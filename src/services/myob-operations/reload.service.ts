import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import moment from 'moment'
import * as _ from 'lodash';
import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';
import { ChartOfAccountParser } from 'src/parsers/account';
import { QueueDataHandler } from '@shared/queue-data-service';
import { CustomerParser } from 'src/parsers/customer';
import { PersonalParser } from 'src/parsers/personal';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ItemParser } from 'src/parsers/item';
import { InvoiceParser } from 'src/parsers/invoice';
import { HTTPService } from '@shared/http-service';
import { CustomerPaymentParser } from 'src/parsers/customer-payment';
import { SupplierPaymentParser } from 'src/parsers/supplier-payment';
import { BillParser } from 'src/parsers/bill';
import { EmployeeParser } from 'src/parsers/employee';
import { stringFormat } from '@shared/functions';
import { Constant } from '@shared/constants';
import {  ReloadType } from '@shared/enums/comman-enum';
import { ReloadServiceKeys } from '@shared/enums/reload-enum';
const httpService = new HTTPService()
let apisvc = new CommanAPIService()
export class MonthlReloadService {

    coa: any;
    /**
     * Reload the company based on the sync date of company
     * @param date 
     * @param businessId 
     * @param realmId 
     */
    async reloadCompany(date: any, businessId: string, realmId: string, isMonthlyReload: boolean) {
        try {
          // Convert date into required format
          let syncDate = moment(date, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]').subtract(2, 'minutes').format('YYYY-MM-DD[T]HH:mm:ss-00:00');
          console.log('****syncDate****', syncDate);

        let accessTokenUrl: string = stringFormat(Constant.urlConstant.serviceUrl.accessTokenUrl, [realmId])            
        //let response = await httpService.put(accessTokenUrl, accessTokens);
          // Get access token
          let tokenResponse = await apisvc.getAccessToken(realmId);
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
                  console.log(res);
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
         console.log('In Reload Data');

        // Fetch all entites & thier reports required for reloading a company
        await this.fetchCustomers(syncDate, tokenResponse, realmId, businessId);
        await this.fetchSuppliers(syncDate, tokenResponse, realmId, businessId);
        await this.fetchEmployees(syncDate, tokenResponse, realmId, businessId);
        await this.fetchPersonals(syncDate, tokenResponse, realmId, businessId);
        await this.fetchAccounts(syncDate, tokenResponse, realmId, businessId);
        await this.fetchCustomerPayments(syncDate, tokenResponse, realmId, businessId);
        await this.fetchSupplierPayments(syncDate, tokenResponse, realmId, businessId);
        await this.fetchInvoices(syncDate, tokenResponse, realmId, businessId);
        await this.fetchBills(syncDate, tokenResponse, realmId, businessId);
        await this.fetchItems(syncDate, tokenResponse, realmId, businessId);
    }

    /**
     * Fetch Customer from MYOB CDC API 
     */
    async fetchCustomers(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            console.log('date', date)
            console.log('tokenResponse', tokenResponse)
            console.log('realmId', realmId)
            console.log('businessId', businessId)
            // Fecth CDC date for entities from Qb 
             let url = stringFormat(Constant.urlConstant.myobUrl.customerUrl, [realmId, date]);
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            if (response) {
                let parsedCustomers = new CustomerParser().parseCustomer(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedCustomers);
                logger.info('      ')
                logger.info('Customer reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

    
    /**
       * Fetch Suppliers from MYOB CDC API 
     */
    async fetchSuppliers(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedVendors = new VendorParser().parseVendor(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedVendors);
                logger.info('      ')
                logger.info('Vendor reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

       
    /**
      * Fetch Employees from MYOB CDC API 
     */
    async fetchEmployees(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.employeeUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedEmployees = new EmployeeParser().parseEmployee(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedEmployees);
                logger.info('      ')
                logger.info('Employee reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

        
    /**
        * Fetch Contacts from MYOB CDC API 
     */
    async fetchPersonals(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.personalUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedPersonals = new PersonalParser().parsePersonal(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedPersonals);
                logger.info('      ')
                logger.info('Personal Contact reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

      /**
      * Fetch Accounts from MYOB CDC API 
     */
    async fetchAccounts(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.accountUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedAccounts = new ChartOfAccountParser().parseChartofAccounts(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedAccounts);
                logger.info('      ')
                logger.info('Account reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch CustomerPayments from MYOB CDC API 
     */
    async fetchCustomerPayments(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.customerPaymentUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedCustomerPayments = new CustomerPaymentParser().parseCustomerPayment(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedCustomerPayments);
                logger.info('      ')
                logger.info('Customer Payments reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch SupplierPayments from MYOB CDC API 
     */
    async fetchSupplierPayments(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.vendorPaymentUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedSupplierPayments = new SupplierPaymentParser().parseSupplierPayment(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedSupplierPayments);
                logger.info('      ')
                logger.info('Supplier Payments reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }


    /**
     * Fetch Invoices from MYOB CDC API 
     */
    async fetchInvoices(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.invoiceUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedInvoices = new InvoiceParser().parseInvoice(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedInvoices);
                logger.info('      ')
                logger.info('Invoices reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }


        /**
     * Fetch Bills from MYOB CDC API 
     */
    async fetchBills(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.billUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedBills = new BillParser().parseBill(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedBills);
                logger.info('      ')
                logger.info('Bills reloaded : BusinessId: ' + businessId)
              
            }
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch Items from MYOB CDC API 
     */
    async fetchItems(date: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            // Fecth CDC date for entities from Qb 
            let url = stringFormat(Constant.urlConstant.myobUrl.itemUrl, [realmId, date]);
            
             let response = await apisvc.getQBResource(url, tokenResponse.data.accessToken);
            
            if (response) {
                let parsedItems = new ItemParser().parseItem(response.data, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedItems);
                logger.info('      ')
                logger.info('Items reloaded : BusinessId: ' + businessId)
              
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
            console.log('*********verifyToken*********');
            let url = Constant.urlConstant.myobUrl.accountRight;
            let response = await apisvc.getQBResource(url, accessToken)
            // Check for expected response
            if (response) {
                return true
            }
            return false
        } catch (error) {
            logger.error(error)
            throw error
        }
    }
}