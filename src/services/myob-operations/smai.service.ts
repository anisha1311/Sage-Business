import { HTTPService } from '@shared/http-service';
import { ContactParser } from 'src/parsers/contact';
import { PersonalParser } from 'src/parsers/personal';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ItemParser } from 'src/parsers/item';
import { InvoiceParser } from 'src/parsers/invoice';
import { PaymentParser } from 'src/parsers/payment';
import { SupplierPaymentParser } from 'src/parsers/supplier-payment';
import { JournalTransactionParser } from 'src/parsers/journal-transaction';
import { BillParser } from 'src/parsers/bill';
import { EmployeeParser } from 'src/parsers/employee';
import { MyobConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { MyobDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
import { AccessTokenParser } from 'src/parsers/access-tokens';
import { ContactType } from '@shared/enums/contact-type-enum';
import { ChartOfAccountParser } from 'src/parsers/account';
import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';
import { QueueHandler } from '@shared/queues';
import logger from '@shared/logger';
import moment from 'moment';
import { addMonths, getDateByAddingSeconds, getThreeYearAgoDate, stringFormat } from '@shared/functions';
import { isArray } from 'util';
//import moment_tz from 'moment-timezone';
import { Constant } from '@shared/constants';
import { DateFormat, TimeUnitKeys } from '@shared/enums/comman-enum';
import { CommanAPIService } from '@shared/api-service';
import { MonthlReloadService } from './reload.service';
import { ReloadServiceKeys } from '@shared/enums/reload-enum';
import { start } from 'repl';
import { before, constant, last } from 'lodash';

const httpService = new HTTPService()
const myobDataReaderService = new MyobDataReaderService();
const myobConnectionService = new MyobConnectionService();

let apisvc = new CommanAPIService() 
const reloadsbc = new MonthlReloadService()

export class SmaiBusinessService {
    public accessTokens: any = '';
    public companyExist: any = false;
    /**
     * will post add Business Info to smai-Business-service
     */
    async saveBusiness(code: string) {
        try {
            // Get access token from myob 
            this.accessTokens = await myobConnectionService.getTokens(code);
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
                                let currentDate = new Date();
                                let onBoardDate = getThreeYearAgoDate().toString();
                                
                                //******** GET ALL CHART OF ACCOUNT */    
                               // console.log('Customer OnBoarding Start');
                                await this.getSaveContacts(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL accounts Data */
                                   //console.log('accounts OnBoarding Start');
                                await this.getAccountData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL item Data */
                                   //console.log('item OnBoarding Start');
                                await this.getItemsData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL invoice Data */
                                   //console.log('invoice OnBoarding Start');
                                await this.getInvoicesData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL customer payment Data */
                                   //console.log('customer payment OnBoarding Start');
                                await this.getPaymentData(this.accessTokens, businessId, realmId, onBoardDate);

                                     //******** GET ALL Journal	transaction Data */
                                   //console.log('Journal transaction OnBoarding Start');
                                await this.getJournalTransaction(this.accessTokens, businessId, realmId, onBoardDate);

                                //this.saveCompanyData(realmId, accessTokens.access_token, accessTokens.refresh_token,businessId, this.lastCalloutDate);
                                let companydata = parsedCompany as any;
                                companydata.businessId = businessId;

                                //return { status: true, data: response.data.data, message: Constant.busResMsg.addBusiness }

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
     * will fetch and save company data over successfully load company
     */
    async getSaveContacts(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
       await this.saveContacts(accessTokens, businessId, realmId, updated_or_created_since)
    }
    
    /**
     * Will parse and get customer
     */
     async saveContacts(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let contactsData:any = [];
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
                contactsData.push({value: customers , label: 'customer'})
                //logger.info("customers Fetched--->" + customers.Items.length)
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
                contactsData.push({value: vendors , label: 'vendors'})
               // logger.info("vendors Fetched--->" + vendors.Items.length)
            }

            let employees:any;
            // Call myob api to fetch vendors
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
                contactsData.push({value: employees , label: 'employees'})
                //logger.info("employees Fetched--->" + employees.Items.length)
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
                contactsData.push({value: personals , label: 'personals'})
               // logger.info("personals Fetched--->" + personals.Items.length)
            }
            let parsedContacts = new ContactParser().parseContact(contactsData, businessId);
            //logger.info("contact parsed" + JSON.stringify(parsedContacts))
            this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedContacts);
            //logger.info("contact Fetched: businessId: " + businessId)
           
        } catch (error) {       
            logger.error("customers Failed:-" + error);
        }
    }

    
    /**
     * will fetch and save company data over successfully load company
     */
    async getAccountData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveAccounts(accessTokens, businessId, realmId, updated_or_created_since)
     }


      /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
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
                //logger.info("accounts Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("accounts Failed:-" + error);
        }
    }


    /**
     * will fetch and save company data over successfully load company
     */
    async getItemsData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveItems(accessTokens, businessId, realmId, updated_or_created_since)
     }

      /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
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
                //logger.info("items Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("items Failed:-" + error);
        }
    }


    /**
     * will fetch and save company data over successfully load company
     */
    async getInvoicesData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveInvoices(accessTokens, businessId, realmId, updated_or_created_since)
     }

      /**
     * Will parse and get contact
     */
    async saveInvoices(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let invoiceData: any = [];
            let invoices:any;
            // Call myob api to fetch items
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
                invoiceData.push({value: invoices , label: 'invoice'})
            }

            let bills:any;
            // Call myob api to fetch items
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
                invoiceData.push({value: bills , label: 'bill'})
            }

            let parsedInvoice = new InvoiceParser().parseInvoice(invoiceData, businessId);
            //logger.info("invoice parsed" + JSON.stringify(parsedInvoice))
            this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, parsedInvoice);
            //logger.info("invoices Fetched: businessId: " + businessId)
           
        } catch (error) {       
            logger.error("invoices Failed:-" + error);
        }
    }

    /**
     * will fetch and save company data over successfully load company
     */
    async getPaymentData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.savePayments(accessTokens, businessId, realmId, updated_or_created_since)
     }
    
       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async savePayments(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
            let paymentsData:any = [];
            let customerPayments:any;
            // Call myob api to fetch items
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
                paymentsData.push({value: customerPayments , label: 'customerPayments'})
            }

            let supplierPayments:any;
            // Call myob api to fetch items
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
                paymentsData.push({value: supplierPayments , label: 'supplierPayments'})
            }

            let parsedPayments = new PaymentParser().parsePayment(paymentsData, businessId)
            //logger.info("payments parsed" + JSON.stringify(parsedPayments))
            this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedPayments);
            //logger.info("customer payment Fetched: businessId: " + businessId)
           
        } catch (error) {       
            logger.error("customer payment Failed:-" + error);
        }    
    }
   

    /**
     * will fetch and save company data over successfully load company
     */
    async getJournalTransaction(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveJournalTransaction(accessTokens, businessId, realmId, updated_or_created_since)
    }
   /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveJournalTransaction(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {

        try {
            let jouralTransaction:any;
            // Call myob api to fetch items
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
                this.prepareAndSendQueueData(EntityType.transactions, OperationType.CREATE, businessId, parsedJournalTransactions);
                //logger.info("journal transaction Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("journal transaction Failed:-" + error);
        } 
    }
    /** Will Prepare and send data to queue
     * @param CONTACT 
     * @param CREATE 
     * @param parsedContacts 
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