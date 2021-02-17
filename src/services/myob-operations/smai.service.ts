import { HTTPService } from '@shared/http-service';
import { CustomerParser } from 'src/parsers/customer';
import { PersonalParser } from 'src/parsers/personal';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ItemParser } from 'src/parsers/item';
import { InvoiceParser } from 'src/parsers/invoice';
import { CustomerPaymentParser } from 'src/parsers/customer-payment';
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
                console.log('length', length);
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

                                return { status: true, data: response.data.data, message: Constant.busResMsg.updatedBusiness }
                            } else {                              
                                    // New business saved
                                console.log('New company')
                                let businessId = response.data.data.id; 
                                let realmId = response.data.data.businessPlateformId;
                                let currentDate = new Date();
                                let onBoardDate = getThreeYearAgoDate().toString();
                                
                                //******** GET ALL CHART OF ACCOUNT */    
                               // console.log('Customer OnBoarding Start');
                                await this.getCustomerData(this.accessTokens, businessId, realmId, onBoardDate);

                                  //******** GET ALL vendor Data */
                                   //console.log('vendor OnBoarding Start');
                                await this.getVendorData(this.accessTokens, businessId, realmId, onBoardDate);

                                //******** GET ALL employee Data */
                                   //console.log('employee OnBoarding Start');
                                await this.getEmployeeData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL personals Data */
                                   //console.log('personals OnBoarding Start');
                                await this.getPersonalData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL accounts Data */
                                   //console.log('accounts OnBoarding Start');
                            await this.getAccountData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL item Data */
                                   //console.log('item OnBoarding Start');
                                await this.getItemsData(this.accessTokens, businessId, realmId, onBoardDate);

                                   

                                   //******** GET ALL invoice Data */
                                   //console.log('invoice OnBoarding Start');
                                await this.getInvoicesData(this.accessTokens, businessId, realmId, onBoardDate);

                                   
                                   //******** GET ALL bill Data */
                                   //console.log('bill OnBoarding Start');
                                await this.getBillsData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL customer payment Data */
                                   //console.log('customer payment OnBoarding Start');
                                await this.getCustomerPaymentData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL supplier payment Data */
                                   //console.log('supplier payment OnBoarding Start');
                                await this.getSupplierPaymentData(this.accessTokens, businessId, realmId, onBoardDate);

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
    async getCustomerData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
       await this.saveCustomers(accessTokens, businessId, realmId, updated_or_created_since)
    }
    
    /**
     * Will parse and get customer
     */
     async saveCustomers(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
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
                let parsedCustomers = new CustomerParser().parseCustomer(customers, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedCustomers);
                logger.info("customers Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("customers Failed:-" + error);
        }
    }

    async getVendorData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveVendors(accessTokens, businessId, realmId, updated_or_created_since)
     }

    /**
     * Will parse and get vendor
     * @param accessToken 
     * @param calloutUri 
     * @param businessId  
     */
    async saveVendors(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {

        try {
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
                let parsedvendors = new VendorParser().parseVendor(vendors, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedvendors);
                logger.info("vendors Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("vendors Failed:-" + error);
        }
    }


    /**
     * will fetch and save company data over successfully load company
     */
    async getEmployeeData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveEmployees(accessTokens, businessId, realmId, updated_or_created_since)
     }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveEmployees(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
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
                let parsedemployee = new EmployeeParser().parseEmployee(employees, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedemployee);
                logger.info("employees Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("employees Failed:-" + error);
        }
    }


    /**
     * will fetch and save company data over successfully load company
     */
    async getPersonalData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.savePersonals(accessTokens, businessId, realmId, updated_or_created_since)
     }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async savePersonals(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
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
                let parsedPersonal = new PersonalParser().parsePersonal(personals, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedPersonal);
                logger.info("personals Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("personals Failed:-" + error);
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
                logger.info("accounts Fetched: businessId: " + businessId)
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
                logger.info("items Fetched: businessId: " + businessId)
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
                let parsedInvoice = new InvoiceParser().parseInvoice(invoices, businessId);
                this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, parsedInvoice);
                logger.info("invoices Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("invoices Failed:-" + error);
        }
    }
    /**
     * will fetch and save company data over successfully load company
     */
    async getBillsData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveBills(accessTokens, businessId, realmId, updated_or_created_since)
     }
       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveBills(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {

        try {
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
                let parsedBill = new BillParser().parseBill(bills, businessId);
                this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, parsedBill);
                logger.info("bills Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("bills Failed:-" + error);
        }       
    }
    /**
     * will fetch and save company data over successfully load company
     */
    async getCustomerPaymentData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveCustomerPayments(accessTokens, businessId, realmId, updated_or_created_since)
     }
    
       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveCustomerPayments(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        try {
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
                let parsedCustomerPayments = new CustomerPaymentParser().parseCustomerPayment(customerPayments, businessId)
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedCustomerPayments);
                logger.info("customer payment Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("customer payment Failed:-" + error);
        }    
    }
    /**
     * will fetch and save company data over successfully load company
     */
    async getSupplierPaymentData(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {
        await this.saveSupplierPayments(accessTokens, businessId, realmId, updated_or_created_since)
     }
    
       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveSupplierPayments(accessTokens: any, businessId: string, realmId: string, updated_or_created_since: string) {

        try {
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
                let parsedSupplierPayments = new SupplierPaymentParser().parseSupplierPayment(supplierPayments, businessId)
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedSupplierPayments);
                logger.info("supplier payment Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("supplier payment Failed:-" + error);
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
                logger.info("journal transaction Fetched: businessId: " + businessId)
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
        console.log('queueData--', queueData);

        QueueHandler.sendMessage(process.env.QUEUE_NAME, queueData);
    }
}