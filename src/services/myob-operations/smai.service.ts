import { HTTPService } from '@shared/http-service';
import { CustomerParser } from 'src/parsers/customer';
import { PersonalParser } from 'src/parsers/personal';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ItemParser } from 'src/parsers/item';
import { InvoiceParser } from 'src/parsers/invoice';
import { CustomerPaymentParser } from 'src/parsers/customer-payment';
import { SupplierPaymentParser } from 'src/parsers/supplier-payment';
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
                            if (response.data.data && response.data.data.companyExist && response.data.data.companyExist === true) { //response.data.data.companyExist && response.data.data.companyExist === true
                                console.log('reload company')
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
                                //console.log('Account OnBoarding Start');
                                //await this.getCustomerData(this.accessTokens, businessId, realmId, onBoardDate);

                                  //******** GET ALL vendor Data */
                                   //console.log('vendor OnBoarding Start');
                               // await this.getVendorData(this.accessTokens, businessId, realmId, onBoardDate);

                                //******** GET ALL employee Data */
                                   //console.log('employee OnBoarding Start');
                                   //await this.getEmployeeData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL personals Data */
                                   //console.log('personals OnBoarding Start');
                                   //await this.getPersonalData(this.accessTokens, businessId, realmId, onBoardDate);

                                   //******** GET ALL accounts Data */
                                   //console.log('accounts OnBoarding Start');
                                   //await this.getAccountData(this.accessTokens, businessId, realmId, onBoardDate);


                                   //******** GET ALL item Data */
                                   //console.log('item OnBoarding Start');
                                   //await this.getItemsData(this.accessTokens, businessId, realmId, onBoardDate);

                                   

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
            let customerData:any;
            // Call myob api to fetch customers
            let customers = await myobDataReaderService.getAllCustomers(accessTokens.access_token, realmId, updated_or_created_since); 
            customerData = customers.Items;
            if(customers === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let customers = await myobDataReaderService.getAllCustomers(accessTokens.access_token, realmId, updated_or_created_since);    
                customerData = customers.Items;
            } 
            if (customerData.length != 0) {
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
            let vendorData:any;
            // Call myob api to fetch vendors
            let vendors = await myobDataReaderService.getAllSuppliers(accessTokens.access_token, realmId, updated_or_created_since); 
            console.log('vendors response smai ::::: ', vendors);
            
            vendorData = vendors.Items;
            if(vendors === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let vendors = await myobDataReaderService.getAllSuppliers(accessTokens.access_token, realmId, updated_or_created_since);    
                vendorData = vendors.Items;
            } 
            if (vendorData.length != 0) {
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
            let employeeData:any;
            // Call myob api to fetch vendors
            let vendors = await myobDataReaderService.getAllEmployees(accessTokens.access_token, realmId, updated_or_created_since); 
            console.log('employee response smai ::::: ', vendors);
            
            employeeData = vendors.Items;
            if(vendors === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let vendors = await myobDataReaderService.getAllEmployees(accessTokens.access_token, realmId, updated_or_created_since);    
                employeeData = vendors.Items;
            } 
            if (employeeData.length != 0) {
                let parsedemployee = new EmployeeParser().parseEmployee(vendors, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedemployee);
                logger.info("vendors Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("vendors Failed:-" + error);
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
            let personalData:any;
            // Call myob api to fetch personals
            let personals = await myobDataReaderService.getAllPersonals(accessTokens.access_token, realmId, updated_or_created_since); 
            console.log('personals response smai ::::: ', personals);
            
            personalData = personals.Items;
            if(personals === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let personals = await myobDataReaderService.getAllPersonals(accessTokens.access_token, realmId, updated_or_created_since);    
                personalData = personals.Items;
            } 
            if (personalData.length != 0) {
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
            let accountData:any;
            // Call myob api to fetch accounts
            let accounts = await myobDataReaderService.getAllAccounts(accessTokens.access_token, realmId, updated_or_created_since);             
            accountData = accounts.Items;
            if(accounts === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let accounts = await myobDataReaderService.getAllAccounts(accessTokens.access_token, realmId, updated_or_created_since);    
                accountData = accounts.Items;
            } 
            if (accountData.length != 0) {
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
            let itemData:any;
            // Call myob api to fetch items
            let items = await myobDataReaderService.getAllItems(accessTokens.access_token, realmId, updated_or_created_since); 
            console.log('item response smai ::::: ', items);
            
            itemData = items.Items;
            if(items === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let items = await myobDataReaderService.getAllItems(accessTokens.access_token, realmId, updated_or_created_since);    
                itemData = items.Items;
            } 
            if (itemData.length != 0) {
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
            let invoiceData:any;
            // Call myob api to fetch items
            let invoices = await myobDataReaderService.getAllInvoices(accessTokens.access_token, realmId, updated_or_created_since); 
            console.log('invoice response smai ::::: ', invoices);
            
            invoiceData = invoices.Items;
            if(invoices === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let invoices = await myobDataReaderService.getAllInvoices(accessTokens.access_token, realmId, updated_or_created_since);    
                invoiceData = invoices.Items;
            } 
            if (invoiceData.length != 0) {
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
            let billData:any;
            // Call myob api to fetch items
            let bills = await myobDataReaderService.getAllBills(accessTokens.access_token, realmId, updated_or_created_since);
            billData = bills.Items;
            if(bills === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let bills = await myobDataReaderService.getAllBills(accessTokens.access_token, realmId, updated_or_created_since);    
                billData = bills.Items;
            } 
            if (billData.length != 0) {
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
            let customerPaymentsData:any;
            // Call myob api to fetch items
            let customerPayments = await myobDataReaderService.getAllCustomerPayments(accessTokens.access_token, realmId, updated_or_created_since);
            customerPaymentsData = customerPayments.Items;
            if(customerPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let customerPayments = await myobDataReaderService.getAllCustomerPayments(accessTokens.access_token, realmId, updated_or_created_since);    
                customerPaymentsData = customerPayments.Items;
            } 
            if (customerPaymentsData.length != 0) {
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
            let supplierPaymentsData:any;
            // Call myob api to fetch items
            let supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessTokens.access_token, realmId, updated_or_created_since);
            supplierPaymentsData = supplierPayments.Items;
            if(supplierPayments === Constant.commanResMsg.UnauthorizedStatusCode){                
                let response = await myobConnectionService.refreshTokensByRefreshToken(accessTokens.refresh_token);
                if (response.access_token) {
                    apisvc.formatTokens(response, realmId);
                    this.accessTokens = response;
                    accessTokens = this.accessTokens;
                }
                let supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessTokens.access_token, realmId, updated_or_created_since);    
                supplierPaymentsData = supplierPayments.Items;
            } 
            if (supplierPaymentsData.length != 0) {
                let parsedSupplierPayments = new SupplierPaymentParser().parseSupplierPayment(supplierPayments, businessId)
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedSupplierPayments);
                logger.info("supplier payment Fetched: businessId: " + businessId)
            }
           
        } catch (error) {       
            logger.error("supplier payment Failed:-" + error);
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
                source: Constant.commanConst.smaiQbService.toString(),
                destination: Constant.commanConst.smaiBusinessService.toString(),
                businessId: businessId
            },
            data: data
        }
        console.log('queueData--', queueData);

        QueueHandler.sendMessage(process.env.QUEUE_NAME, queueData);
    }
}