import { HTTPService } from '@shared/http-service';
import { ContactParser } from 'src/parsers/contact';
import { CompanyParser } from 'src/parsers/company';
import { ItemParser } from 'src/parsers/item';
import { InvoiceBillParser } from 'src/parsers/invoice';
import { PaymentParser } from 'src/parsers/payment';
import { JournalTransactionParser } from 'src/parsers/journal-transaction';
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { MyobDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
import { AccessTokenParser } from 'src/parsers/access-tokens';
import { ChartOfAccountParser } from 'src/parsers/account';
import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';
import { QueueHandler } from '@shared/queues';
import logger from '@shared/logger';
import {getThreeYearAgoDate} from '@shared/functions';
import { Constant } from '@shared/constants';
import { CommanAPIService } from '@shared/api-service';
import { MonthlReloadService } from './reload.service';

const httpService = new HTTPService()
const myobDataReaderService = new MyobDataReaderService();
const myobConnectionService = new MyobConnectionService();
let apisvc = new CommanAPIService() 
const reloadsbc = new MonthlReloadService()

export class SmaiBusinessService {
    public accessTokens: any = ''; /*Global Varibale to get the access token details */
    public companyExist: any = false; /*Global Varibale to set when the company already exist */
    /**
     * will post add Business Info to smai-Business-service
     * @param code 
     */
    async saveBusiness(code: string) {
        try {
            // Get access token from myob 
            this.accessTokens = await myobConnectionService.getTokens(code);
             // Fetch company information
            let companyInfo = await myobDataReaderService.getCompanyInfo(this.accessTokens.access_token);
            if(companyInfo){
                let length = companyInfo.length || 0;
                if (companyInfo && length > 0) {
                    for (let i = 0; i < length; i++) {
                        const company = companyInfo[i];
                        let realmId = company.Id;
                        let parsedCompany = CompanyParser.parseCompany(realmId, company);
                        let companyAddress = CompanyParser.parseCompanyAddress(company);                        
                        let parsedAccessToken = AccessTokenParser.parseAccessTokens(this.accessTokens);
                        
                        let requestBody = {
                            "business": parsedCompany,
                            "address": companyAddress,
                            "token": parsedAccessToken
                        }
                         // Call business service API to save business
                        let response = await httpService.post(Constant.urlConstant.serviceUrl.businessUrl, requestBody);                           
                        // Check for response form business service
                        if (response.data.status == false) {
                            try {
                                logger.error(JSON.stringify(response.data.error))
                            } catch (error) {
                                console.log('response status parse error')
                                logger.error(error)
                            }
                            throw new Error(Constant.busResMsg.businessConnectFailed)
                        }
                        if (response.data.status) {     
                            let business = response.data.data;   
                            // Business already exist relaod the businesss
                            if (response.data.data && this.companyExist && this.companyExist === true) {                                                                                                              
                                console.log('Compnay already exists');
                                await reloadsbc.reloadCompany(business.syncDate, business.id, business.businessPlateformId, false)

                            } else {                              
                                // New business saved
                                console.log('New company')
                                let businessId = response.data.data.id; 
                                let realmId = response.data.data.businessPlateformId;
                                console.log('For MYOB Company ', realmId);
                                let onBoardDate = getThreeYearAgoDate().toString();
                                
                                //******** GET ALL CUSTOMERS-VENDORS-EMPLOYEE-PERSONAL */    
                               // await this.getContacts(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL ACCOUNTS */
                               // await this.getAccountData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL ITEMS */
                              //  await this.getItemsData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL INVOICE-BILLS */
                                await this.getInvoicesData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL CUSTOMER PAYMENT-SUPPLIER PAYMENT */
                             //   await this.getPaymentData(this.accessTokens, businessId, realmId, onBoardDate);

                                     //******** GET ALL JOURNAL TRANSACTION */
                              //  await this.getJournalTransaction(this.accessTokens, businessId, realmId, onBoardDate);

                                let companydata = parsedCompany as any;
                                companydata.businessId = businessId;
                            }
                        } else {
                            console.log('Empty response')
                            return { status: false, data: response, message: Constant.busResMsg.businessConnectFailed }
                        }
                        
                    }   
                    this.companyExist = true;
                } 
            }   
        } catch (error) {
            console.log('error occured while onboard' + error)
            throw error

        }
    }
     /**
     * will fetch and save contact data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getContacts(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
       await this.saveContacts(accessTokens, businessId, realmId, updated_or_created_since)
    }
      /**
      * Will parse and get contacts
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
     async saveContacts(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let contactsData:any = [];
            let totalLength = 0;
            let customers:any;
            // Call myob api to fetch customers
            customers = await myobDataReaderService.getAllCustomers(accessTokens.access_token, realmId, updated_or_created_since); 
            if(customers === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                customers = await myobDataReaderService.getAllCustomers(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (customers.Items.length != 0) {
                totalLength += customers.Items.length;
                contactsData.push({value: customers , label: 'customer'})
            }  
            
            let vendors:any;
            // Call myob api to fetch vendors
            vendors = await myobDataReaderService.getAllSuppliers(accessTokens.access_token, realmId, updated_or_created_since);
            if(vendors === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }  
                vendors = await myobDataReaderService.getAllSuppliers(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (vendors.Items.length != 0) {
                totalLength += vendors.Items.length;
                contactsData.push({value: vendors , label: 'vendors'})
            }

            let employees:any;
            // Call myob api to fetch employees
            employees = await myobDataReaderService.getAllEmployees(accessTokens.access_token, realmId, updated_or_created_since); 
            if(employees === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                employees = await myobDataReaderService.getAllEmployees(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (employees.Items.length != 0) {
                totalLength += employees.Items.length;
                contactsData.push({value: employees , label: 'employees'})
            }

            let personals:any;
            // Call myob api to fetch personals
            personals = await myobDataReaderService.getAllPersonals(accessTokens.access_token, realmId, updated_or_created_since); 
            if(personals === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                personals = await myobDataReaderService.getAllPersonals(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (personals.Items.length != 0) {
                totalLength += personals.Items.length;
                contactsData.push({value: personals , label: 'personals'})
            }
            if(totalLength != 0 ){
                let parsedContacts = new ContactParser().parseContact(contactsData, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedContacts);
            }         
            logger.info("contact Fetched: (" + totalLength + ")" + " businessId: "  + businessId)
           
        } catch (error) {       
            logger.error("Contacts Failed:-" + error);
        }
    }

    /**
     * will fetch and save account data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getAccountData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveAccounts(accessTokens, businessId, realmId, updated_or_created_since)
     }

  /**
      * Will parse and get accounts
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async saveAccounts(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let accounts:any;
            // Call myob api to fetch accounts
            accounts = await myobDataReaderService.getAllAccounts(accessTokens.access_token, realmId, updated_or_created_since);             
            if(accounts === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                accounts = await myobDataReaderService.getAllAccounts(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (accounts.Items.length != 0) {
                let parsedAccount = new ChartOfAccountParser().parseChartofAccounts(accounts, businessId);
                this.prepareAndSendQueueData(EntityType.account, OperationType.CREATE, businessId, parsedAccount);
            }            
            logger.info("accounts Fetched: (" + accounts.Items.length + ")" + " businessId: "  + businessId)
           
        } catch (error) {       
            logger.error("accounts Failed:-" + error);
        }
    }


    /**
     * will fetch and save item data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getItemsData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveItems(accessTokens, businessId, realmId, updated_or_created_since)
     }

    /**
      * Will parse and get items
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async saveItems(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let items:any;
            // Call myob api to fetch items
            items = await myobDataReaderService.getAllItems(accessTokens.access_token, realmId, updated_or_created_since); 
            
            if(items === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                items = await myobDataReaderService.getAllItems(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (items.Items.length != 0) {
                let parsedItem = new ItemParser().parseItem(items, businessId);
                this.prepareAndSendQueueData(EntityType.item, OperationType.CREATE, businessId, parsedItem);               
            }
            logger.info("items Fetched: (" + items.Items.length + ")" + " businessId: "  + businessId)
           
        } catch (error) {       
            logger.error("items Failed:-" + error);
        }
    }


    /**
     * will fetch and save invoice data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getInvoicesData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveInvoices(accessTokens, businessId, realmId, updated_or_created_since)
     }

    /**
      * Will parse and get invoice
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async saveInvoices(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let invoiceBillData: any = [];
            let totalLength = 0;
            let invoices:any;
            // Call myob api to fetch invoices
            invoices = await myobDataReaderService.getAllInvoices(accessTokens.access_token, realmId, updated_or_created_since); 
            
            if(invoices === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                invoices = await myobDataReaderService.getAllInvoices(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (invoices.Items.length != 0) {
                totalLength += invoices.Items.length;
                invoiceBillData.push({value: invoices , label: 'invoice'})
            }

            let bills:any;
            // Call myob api to fetch bills
            bills = await myobDataReaderService.getAllBills(accessTokens.access_token, realmId, updated_or_created_since);
            if(bills === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                bills = await myobDataReaderService.getAllBills(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (bills.Items.length != 0) {
                totalLength += bills.Items.length;
                invoiceBillData.push({value: bills , label: 'bill'})
            }
            if(totalLength  != 0 ) {
                let parsedInvoiceBill = new InvoiceBillParser().parseInvoiceBills(invoiceBillData,accessTokens.access_token, businessId);
                this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, await parsedInvoiceBill);
            }           
            logger.info("invoices-bills Fetched: (" + totalLength + ")" + " businessId: "  + businessId)
           
        } catch (error) {       
            logger.error("invoices-bills Failed:-" + error);
        }
    }

    /**
     * will fetch and save payments data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getPaymentData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.savePayments(accessTokens, businessId, realmId, updated_or_created_since)
     }
     /**
      * Will parse and get payments
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async savePayments(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let paymentsData:any = [];
            let totalLength = 0;
            let customerPayments:any;
            // Call myob api to fetch customer payment
            customerPayments = await myobDataReaderService.getAllCustomerPayments(accessTokens.access_token, realmId, updated_or_created_since);
            if(customerPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                customerPayments = await myobDataReaderService.getAllCustomerPayments(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (customerPayments.Items.length != 0) {
                totalLength += customerPayments.Items.length;
                paymentsData.push({value: customerPayments , label: 'customerPayments'})
            }

            let supplierPayments:any;
            // Call myob api to fetch supplier payment
            supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessTokens.access_token, realmId, updated_or_created_since);
            if(supplierPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessTokens.access_token, realmId, updated_or_created_since);    
            } 
            if (supplierPayments.Items.length != 0) {
                totalLength += supplierPayments.Items.length;
                paymentsData.push({value: supplierPayments , label: 'supplierPayments'})
            }
            if( totalLength != 0) { 
                let parsedPayments = new PaymentParser().parsePayment(paymentsData, businessId)
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedPayments);
            }         
            logger.info("payment Fetched: (" + totalLength + ")" + " businessId: "  + businessId)
           
        } catch (error) {       
            logger.error("payment Failed:-" + error);
        }    
    }
   
    /**
     * will fetch and save journal transaction data over successfully load company
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async getJournalTransaction(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveJournalTransaction(accessTokens, businessId, realmId, updated_or_created_since)
    }
   /**
      * Will parse and get journal transaction
     * @param accessTokens 
     * @param businessId 
     * @param realmId 
     * @param updated_or_created_since 
     */
    async saveJournalTransaction(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {

        try {
            let jouralTransaction:any;
            // Call myob api to fetch journal transaction
            jouralTransaction = await myobDataReaderService.getAllJournalTransactions(accessTokens.access_token, realmId, updated_or_created_since);
            if(jouralTransaction === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;  
                    accessTokens = this.accessTokens;
                } 
                jouralTransaction = await myobDataReaderService.getAllJournalTransactions(accessTokens.access_token, realmId, updated_or_created_since);    
            }   
            if (jouralTransaction.Items.length != 0) {
                let parsedJournalTransactions = new JournalTransactionParser().parseJournalTransaction(jouralTransaction, businessId)
                this.prepareAndSendQueueData(EntityType.jv, OperationType.CREATE, businessId, parsedJournalTransactions);               
            }
            logger.info("journal transaction Fetched: (" + jouralTransaction.Items.length + ")" + " businessId: "  + businessId)
        } catch (error) {       
            logger.error("journal transaction Failed:-" + error);
        }  
    }     
    /** Will Prepare and send data to queue 
     * @param entityType 
     * @param operationType 
     * @param businessId 
     */
    prepareAndSendQueueData(entityType: EntityType, operationType: OperationType, businessId: string, data: []) {        
        if (data && data.length == 0) {
            if (entityType === EntityType.jv || entityType === EntityType.transactions) {
                data = []
            } else {
                return
            }
        }

        let queueData =
        {
            metadata:
            {
                entity: entityType,
                operation: operationType,
                timestamp: new Date().toISOString(),
                source: Constant.commanConst.smaiMYOBService.toString(),
                destination: Constant.commanConst.smaiBusinessService.toString(),
                businessId: businessId
            },
            data: data
        }
        QueueHandler.sendMessage(process.env.QUEUE_NAME, queueData);
    }
}