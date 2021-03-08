import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import moment from 'moment'  
import { JournalTransactionParser } from 'src/parsers/journal-transaction';
import * as _ from 'lodash';  
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { MyobDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';  
import { ChartOfAccountParser } from 'src/parsers/account';
import { QueueDataHandler } from '@shared/queue-data-service';
import { ContactParser } from 'src/parsers/contact';
import { CompanyParser } from 'src/parsers/company';
import { ItemParser } from 'src/parsers/item';
import { InvoiceBillParser } from 'src/parsers/invoice';
import { HTTPService } from '@shared/http-service';
import { PaymentParser } from 'src/parsers/payment';
import { SupplierPaymentParser } from 'src/parsers/supplier-payment';
import { stringFormat } from '@shared/functions';
import { Constant } from '@shared/constants';
import {  ReloadType } from '@shared/enums/comman-enum';
import { ReloadServiceKeys } from '@shared/enums/reload-enum';
const httpService = new HTTPService()
let apisvc = new CommanAPIService()
const myobDataReaderService = new MyobDataReaderService();
const myobConnectionService = new MyobConnectionService();
export class MonthlReloadService {

    public tokenResponse: any = '';
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
          this.tokenResponse = await apisvc.getAccessToken(realmId);
        //  let accessTokenUrl: string = stringFormat(Constant.urlConstant.serviceUrl.accessTokenUrl, [realmId]) 
       
          if (this.tokenResponse.data && this.tokenResponse.status === true) {
              console.log('Token data recieved')
              if (isMonthlyReload) {
                  let res = await this.verifyToken(this.tokenResponse.data.accessToken)
                  if (res) {
                      //start reloading entities
                  } else {
                      logger.info('verify token response was not json')
                      return false
                  }
              } else {
                  // Check if token is valid 
                  let res = await this.verifyToken(this.tokenResponse.data.accessToken)
                  if (res) {
                      //start reloading entities
                      this.reloadData(syncDate, this.tokenResponse, realmId, businessId)
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
        await this.fetchContacts(syncDate, tokenResponse, realmId, businessId);
        await this.fetchAccounts(syncDate, tokenResponse, realmId, businessId);
        await this.fetchPayments(syncDate, tokenResponse, realmId, businessId);
        await this.fetchInvoices(syncDate, tokenResponse, realmId, businessId);
        await this.fetchItems(syncDate, tokenResponse, realmId, businessId);
        await this.fetchJournalTransaction(syncDate, tokenResponse, realmId, businessId);
    }

    /**
     * Fetch Customer from MYOB CDC API 
     */
    async fetchContacts(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let contactsData:any = [];
            let totalLength = 0;
            let customers:any;
            // Call myob api to fetch customers
            customers = await myobDataReaderService.getAllCustomers(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
            if(customers === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                customers = await myobDataReaderService.getAllCustomers(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (customers.Items.length != 0) {
                totalLength += customers.Items.length;
                contactsData.push({value: customers , label: 'customer'})
            }

            let vendors:any;
            // Call myob api to fetch vendors
            vendors = await myobDataReaderService.getAllSuppliers(tokenResponse.data.accessToken, realmId, updated_or_created_since);
            if(vendors === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                vendors = await myobDataReaderService.getAllSuppliers(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (vendors.Items.length != 0) {
                totalLength += vendors.Items.length;
                contactsData.push({value: vendors , label: 'vendors'})
            }

            let employees:any;
            // Call myob api to fetch vendors
            employees = await myobDataReaderService.getAllEmployees(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
            if(employees === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                employees = await myobDataReaderService.getAllEmployees(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (employees.Items.length != 0) {
                totalLength += employees.Items.length;
                contactsData.push({value: employees , label: 'employees'})
            }

            let personals:any;
            // Call myob api to fetch personals
            personals = await myobDataReaderService.getAllPersonals(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
            if(personals === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                personals = await myobDataReaderService.getAllPersonals(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (personals.Items.length != 0) {
                totalLength += personals.Items.length;
                contactsData.push({value: personals , label: 'personals'})
            }
            if(totalLength != 0 ){
                let parsedContacts = new ContactParser().parseContact(contactsData, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedContacts);
            }
            logger.info("contact Reloaded: (" + totalLength + ")" + " businessId: "  + businessId)

        } catch (error) {
            logger.error(error)
        }
    }



      /**
      * Fetch Accounts from MYOB CDC API 
     */
    async fetchAccounts(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let accounts:any;
            // Call myob api to fetch accounts
            accounts = await myobDataReaderService.getAllAccounts(tokenResponse.data.accessToken, realmId, updated_or_created_since);             
            if(accounts === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                accounts = await myobDataReaderService.getAllAccounts(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (accounts.Items.length != 0) {
                let parsedAccount = new ChartOfAccountParser().parseChartofAccounts(accounts, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.account, OperationType.REPLACE, businessId, parsedAccount);
            }
            logger.info("accounts Reloaded: (" + accounts.Items.length + ")" + " businessId: "  + businessId)
        } catch (error) {
            logger.error(error)
        }
    }
   /**
     * Fetch Items from MYOB CDC API 
     */
    async fetchItems(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let items:any;
            // Call myob api to fetch items
            items = await myobDataReaderService.getAllItems(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
            
            if(items === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                items = await myobDataReaderService.getAllItems(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (items.Items.length != 0) {
                let parsedItem = new ItemParser().parseItem(items, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.item, OperationType.REPLACE, businessId, parsedItem);
            }
            logger.info("items Reloaded: (" + items.Items.length + ")" + " businessId: "  + businessId)
        } catch (error) {
            logger.error(error)
        }
    }
     /**
     * Fetch Invoices from MYOB CDC API 
     */
      async fetchInvoices(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let invoiceBillData: any = [];
            let totalLength = 0;
            let invoices:any;
            // Call myob api to fetch items
            invoices = await myobDataReaderService.getAllInvoices(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
 
            if(invoices === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                invoices = await myobDataReaderService.getAllInvoices(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (invoices.Items.length != 0) {
                totalLength += invoices.Items.length;
                invoiceBillData.push({value: invoices , label: 'invoice'})
            }

            let bills:any;
            // Call myob api to fetch items
            bills = await myobDataReaderService.getAllBills(tokenResponse.data.accessToken, realmId, updated_or_created_since);
            if(bills === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                bills = await myobDataReaderService.getAllBills(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (bills.Items.length != 0) {
                totalLength += bills.Items.length;
                invoiceBillData.push({value: bills , label: 'bill'})
            }
            if(totalLength  != 0 ) {
                let parsedInvoiceBill = new InvoiceBillParser().parseInvoiceBills(invoiceBillData, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.invoice, OperationType.REPLACE, businessId, parsedInvoiceBill);
            }
            logger.info("invoices-bills Reloaded: (" + totalLength + ")" + " businessId: "  + businessId)
            
           
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch CustomerPayments from MYOB CDC API 
     */
    async fetchPayments(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let paymentsData:any = [];
            let totalLength = 0;
            let customerPayments:any;
            // Call myob api to fetch items
            customerPayments = await myobDataReaderService.getAllCustomerPayments(tokenResponse.data.accessToken, realmId, updated_or_created_since);
            if(customerPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                customerPayments = await myobDataReaderService.getAllCustomerPayments(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (customerPayments.Items.length != 0) {
                totalLength += customerPayments.Items.length;
                paymentsData.push({value: customerPayments , label: 'customerPayments'})
            }

            let supplierPayments:any;
            // Call myob api to fetch items
            supplierPayments = await myobDataReaderService.getAllSupplierPayments(tokenResponse.data.accessToken, realmId, updated_or_created_since);
            if(supplierPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refreshToken);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                supplierPayments = await myobDataReaderService.getAllSupplierPayments(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (supplierPayments.Items.length != 0) {
                totalLength += supplierPayments.Items.length;
                paymentsData.push({value: supplierPayments , label: 'supplierPayments'})
            }
            if( totalLength != 0) { 
                let parsedPayments = new PaymentParser().parsePayment(paymentsData, businessId)
                QueueDataHandler.prepareAndSendQueueData(EntityType.payments, OperationType.REPLACE, businessId, parsedPayments);
            }
            logger.info("payment Reloaded: (" + totalLength + ")" + " businessId: "  + businessId)
            
        } catch (error) {
            logger.error(error)
        }
    }

   

     

 /**
     * Fetch Customer from MYOB CDC API 
     */
    async fetchJournalTransaction(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            let jouralTransaction:any;
            // Call myob api to fetch items
            jouralTransaction = await myobDataReaderService.getAllJournalTransactions(tokenResponse.data.accessToken, realmId, updated_or_created_since);
            if(jouralTransaction === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(tokenResponse.data.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.tokenResponse = response;
                    tokenResponse = this.tokenResponse;
                }
                jouralTransaction = await myobDataReaderService.getAllJournalTransactions(tokenResponse.data.accessToken, realmId, updated_or_created_since);    
            } 
            if (jouralTransaction.Items.length != 0) {
                let parsedJournalTransactions = new JournalTransactionParser().parseJournalTransaction(jouralTransaction, businessId)
                QueueDataHandler.prepareAndSendQueueData(EntityType.transactions, OperationType.REPLACE, businessId, parsedJournalTransactions);
            }
            logger.info("journal transaction Reloaded: (" + jouralTransaction.Items.length + ")" + " businessId: "  + businessId)

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
     * Verify if token can fetch data from myob
     * @param accessToken
     * @param realmId 
     * @param date 
     */
    async verifyToken(accessToken: string) {
        try {
            let url = Constant.urlConstant.myobUrl.accountRight;
            let response = await apisvc.getMYOBResource(url, accessToken)
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