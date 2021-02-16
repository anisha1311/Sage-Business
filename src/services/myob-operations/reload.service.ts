import { CommanAPIService } from '@shared/api-service';
import logger from '@shared/logger';
import moment from 'moment'
import * as _ from 'lodash';
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { MyobDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
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
          console.log('****syncDate****', syncDate);
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
                  console.log(res);
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
    async fetchCustomers(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
            console.log('fetchCustomers');
            let customers:any;
            // Call myob api to fetch customers
            customers = await myobDataReaderService.getAllCustomers(tokenResponse.data.accessToken, realmId, updated_or_created_since); 
            console.log('fetchCustomers', customers);
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
                let parsedCustomers = new CustomerParser().parseCustomer(customers, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedCustomers);
                logger.info("customers Reloaded: businessId: " + businessId)
            }

        } catch (error) {
            logger.error(error)
        }
    }

    
    /**
       * Fetch Suppliers from MYOB CDC API 
     */
    async fetchSuppliers(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedvendors = new VendorParser().parseVendor(vendors, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedvendors);
                logger.info("vendors Reloaded: businessId: " + businessId)
            }
        } catch (error) {
            logger.error(error)
        }
    }

       
    /**
      * Fetch Employees from MYOB CDC API 
     */
    async fetchEmployees(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedemployee = new EmployeeParser().parseEmployee(employees, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedemployee);
                logger.info("employees Reloaded: businessId: " + businessId)
            }
        } catch (error) {
            logger.error(error)
        }
    }

        
    /**
        * Fetch Contacts from MYOB CDC API 
     */
    async fetchPersonals(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedPersonal = new PersonalParser().parsePersonal(personals, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.contact, OperationType.REPLACE, businessId, parsedPersonal);
                logger.info("personals Reloaded: businessId: " + businessId)
            }
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
                logger.info("accounts Reloaded: businessId: " + businessId)
            }
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch CustomerPayments from MYOB CDC API 
     */
    async fetchCustomerPayments(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedCustomerPayments = new CustomerPaymentParser().parseCustomerPayment(customerPayments, businessId)
                QueueDataHandler.prepareAndSendQueueData(EntityType.payments, OperationType.REPLACE, businessId, parsedCustomerPayments);
                logger.info("customer payment Reloaded: businessId: " + businessId)
            }
        } catch (error) {
            logger.error(error)
        }
    }

        /**
     * Fetch SupplierPayments from MYOB CDC API 
     */
    async fetchSupplierPayments(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedSupplierPayments = new SupplierPaymentParser().parseSupplierPayment(supplierPayments, businessId)
                QueueDataHandler.prepareAndSendQueueData(EntityType.payments, OperationType.REPLACE, businessId, parsedSupplierPayments);
                logger.info("supplier payment Reloaded: businessId: " + businessId)
            }
        } catch (error) {
            logger.error(error)
        }
    }


    /**
     * Fetch Invoices from MYOB CDC API 
     */
    async fetchInvoices(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedInvoice = new InvoiceParser().parseInvoice(invoices, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.invoice, OperationType.REPLACE, businessId, parsedInvoice);
                logger.info("invoices Reloaded: businessId: " + businessId)
            }
           
        } catch (error) {
            logger.error(error)
        }
    }


        /**
     * Fetch Bills from MYOB CDC API 
     */
    async fetchBills(updated_or_created_since: string, tokenResponse: any, realmId: string, businessId: string) {

        try {
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
                let parsedBill = new BillParser().parseBill(bills, businessId);
                QueueDataHandler.prepareAndSendQueueData(EntityType.invoice, OperationType.REPLACE, businessId, parsedBill);
                logger.info("bills Reloaded: businessId: " + businessId)
            }
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
                logger.info("items Reloaded: businessId: " + businessId)
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
     * Verify if token can fetch data from myob
     * @param accessToken
     * @param realmId 
     * @param date 
     */
    async verifyToken(accessToken: string) {
        try {
            console.log('*********verifyToken*********');
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