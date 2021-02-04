import { HTTPService } from '@shared/http-service';
import { CustomerParser } from 'src/parsers/customer';
import { PersonalParser } from 'src/parsers/personal';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ContactParser } from 'src/parsers/contact';
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
import { addMonths, stringFormat } from '@shared/functions';
import { isArray } from 'util';
//import moment_tz from 'moment-timezone';
import { Constant } from '@shared/constants';
import { DateFormat, TimeUnitKeys } from '@shared/enums/comman-enum';
import { CommanAPIService } from '@shared/api-service';
import { MonthlReloadService } from './reload.service';
import { ReloadServiceKeys } from '@shared/enums/reload-enum';
import { start } from 'repl';
import { constant } from 'lodash';

const httpService = new HTTPService()
const myobDataReaderService = new MyobDataReaderService();
const myobConnectionService = new MyobConnectionService();

let apisvc = new CommanAPIService() 
const reloadsbc = new MonthlReloadService()

export class SmaiBusinessService {
    public  access_token:string='';
    public  refresh_token:string='';
    public syncDate:any = 'null';
    /**
     * will post add Business Info to smai-Business-service
     * @param callbackString 
     * @param userid 
     * @param timezone 
     */
    async saveBusiness(callbackString: string, access_token : string, refresh_token : string, timezone : string) {
        try {
            let accessTokens:any = {};
            if(callbackString!=='false')
            {                
                // Get access token from myob 
                accessTokens = await myobConnectionService.getTokens(callbackString);
                if (accessTokens.access_token) {
                    console.log('Get the AccessToken Done !!!');
                    this.access_token = accessTokens.access_token;
                    this.refresh_token=accessTokens.refresh_token;
                }
            }
            else
            {
                console.log('Have AccessToken and Refresh Token !!!');
                accessTokens = await myobConnectionService.refreshTokensByRefreshToken(this.refresh_token);

                if (accessTokens.access_token) {
                    console.log('Get the AccessToken Done by Refresh Token !!!');
                    this.access_token = accessTokens.access_token;
                    this.refresh_token=accessTokens.refresh_token;
                }
            }
            // Fetch companies to get the businessId
            let companyInfo = await myobDataReaderService.getCompanyInfo(this.access_token);
            let requestBody;
            if(companyInfo){
                let length = companyInfo.length || 0;
                if (companyInfo && length > 0) {
                    for (let i = 0; i < length; i++) {
                        const company = companyInfo[i];
                        let parsedCompany = CompanyParser.parseCompany(company);
                        let companyAddress = CompanyParser.parseCompanyAddress(company);
                        let parsedAccessToken = AccessTokenParser.parseAccessTokens(accessTokens);
                        requestBody = {
                            "business": parsedCompany,
                            "address": companyAddress,
                            "token": parsedAccessToken
                        }
                        let response = await httpService.post(Constant.urlConstant.serviceUrl.businessUrl, JSON.stringify(requestBody));
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
                            if (response.data.data &&  this.syncDate != 'null') { //response.data.data.companyExist && response.data.data.companyExist === true
                                
                                console.log('reload company')
                                let todayDate:any = moment(Date.now()).format('YYYY-MM-DD');
                                    // if (userId === response.data.data.user._id) {
                                //reloadsbc.reloadCompany(this.access_token, this.syncDate, todayDate, business.id, company.Id, false)
                                reloadsbc.reloadCompany(this.syncDate, todayDate, business.id, company.Id, this.refresh_token, false);
                                // }
                                //return { status: true, data: response.data.data, message: Constant.busResMsg.updatedBusiness }
                            } else {
                                // New business saved
                                console.log('New company')             
                                
                                let businessId = response.data.data.businessId;                            
                                let companydata = parsedCompany as any;
                                companydata.businessId = businessId;
                                let date_ob = new Date();
                                let currentDate:any = ("0" + date_ob.getDate()). slice(-2);
                                let currentMonth:any = ("0" + (date_ob.getMonth() + 1)). slice(-2);
                                let currentYear:any = date_ob.getFullYear(); 
                                let todayDate = currentYear + "-" + currentMonth + "-" + currentDate;
                    
                                if ((currentMonth == 2) && (currentDate == 29)) {
                                    currentDate = 28;
                                }
                                let last3YearDate = currentYear - 3 + "-" + currentMonth + "-" + currentDate;
        
                                this.saveCompanyData(this.access_token, response.data.data.id,  company.Id, last3YearDate, todayDate);        
                               // return { status: true, data: response.data.data, message: Constant.busResMsg.addBusiness }
                            }
                        } else {
                            console.log('Empty response')
                          //  return { status: false, data: response, message: Constant.busResMsg.businessConnectFailed }
                        }
                        
                    }   
                 
                }  
                this.syncDate = moment(Date.now()).format('YYYY-MM-DD');          
                } 
            }
         
         catch (error) {
            console.log('error occured while onboard' + error)
            throw error
        }
    }
     /**
     * will fetch and save company data over successfully load company
     * @param access_token 
     * @param businessId 
     * @param calloutUri 
     */
    saveCompanyData(accessToken: string, businessId: string, companyId: string, startDate:string, endDate:string) {     
    
        
        this.saveCustomers(accessToken, businessId, companyId, startDate, endDate);
        
        //this.saveVendors(accessToken, businessId, companyId, startDate, endDate);
        //this.saveEmployees(accessToken, businessId, companyId, startDate, endDate);
        // this.savePersonals(accessToken, businessId, companyId, startDate, endDate);
      //this.saveAccounts(accessToken, businessId, companyId, startDate, endDate);
        //   this.saveItems(accessToken, businessId, companyId, startDate, endDate); 
        //     this.saveInvoices(accessToken, businessId, companyId, startDate, endDate);
        //this.saveBills(accessToken, businessId, companyId, startDate, endDate); 
        //      this.saveCustomerPayments(accessToken, businessId, companyId, startDate, endDate);  
        //      this.saveSupplierPayments(accessToken, businessId, companyId, startDate, endDate); 
    }
 
    /**
     * Will parse and get customer
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
     async saveCustomers(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let customers = await myobDataReaderService.getAllCustomers(accessToken, companyId, startDate, endDate);    
            if (customers) {
                let parsedCustomers = new CustomerParser().parseCustomer(customers, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedCustomers);
                logger.info("Customers Fetched: businessId: " + businessId)
                this.saveVendors(accessToken, businessId, companyId, startDate, endDate);
            } else {
                 this.saveVendors(accessToken, businessId, companyId, startDate, endDate);
            }
        } catch (error) {
            logger.error("customers Failed:-" + error);
        }
    }

    /**
     * Will parse and get vendor
     * @param accessToken 
     * @param calloutUri 
     * @param businessId  
     */
    async saveVendors(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let vendors = await myobDataReaderService.getAllSuppliers(accessToken, companyId, startDate, endDate);

            if (vendors) {
                let parsedVendors = new VendorParser().parseVendor(vendors, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedVendors);
                logger.info("Vendors Fetched: businessId: " + businessId)
                this.saveEmployees(accessToken, businessId, companyId, startDate, endDate);
            } else {
                this.saveEmployees(accessToken, businessId, companyId, startDate, endDate);
            }
        } catch (error) {
            logger.error("Vendors Failed:-" + error);
        }
    }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveEmployees(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let employees = await myobDataReaderService.getAllEmployees(accessToken, companyId, startDate, endDate);

            if (employees) {
                let parsedEmployees = new EmployeeParser().parseEmployee(employees, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedEmployees);
                logger.info("Employees Fetched: businessId: " + businessId)
                this.savePersonals(accessToken, businessId, companyId, startDate, endDate);
            } else {
                this.savePersonals(accessToken, businessId, companyId, startDate, endDate);
            }
        } catch (error) {
            logger.error("Employees Failed:-" + error);
        }
    }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async savePersonals(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let personals = await myobDataReaderService.getAllPersonals(accessToken, companyId, startDate, endDate);

            if (personals) {
                let parsedPersonals = new PersonalParser().parsePersonal(personals, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedPersonals);
                logger.info("Personals Fetched: businessId: " + businessId)
                this.saveAccounts(accessToken, businessId, companyId, startDate, endDate);
            } else {
                this.saveAccounts(accessToken, businessId, companyId, startDate, endDate);
            }
        } catch (error) {
            logger.error("Personals Failed:-" + error);
        }
    }

    

      /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveAccounts(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let accounts = await myobDataReaderService.getAllAccounts(accessToken, companyId, startDate, endDate);

            if (accounts) {
                let parsedAccounts = new ChartOfAccountParser().parseChartofAccounts(accounts, businessId);
                
                this.prepareAndSendQueueData(EntityType.account, OperationType.CREATE, businessId, parsedAccounts);
                logger.info("Accounts Fetched: businessId: " + businessId)
                this.saveItems(accessToken, businessId, companyId, startDate, endDate); 
            } else {
                this.saveItems(accessToken, businessId, companyId, startDate, endDate); 
            }
        } catch (error) {
            logger.error("Accounts Failed:-" + error);
        }
    }

      /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveItems(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let items = await myobDataReaderService.getAllItems(accessToken, companyId, startDate, endDate);

            if (items) {
                let parsedItems = new ItemParser().parseItem(items, businessId);
                
                this.prepareAndSendQueueData(EntityType.item, OperationType.CREATE, businessId, parsedItems);
                logger.info("Items Fetched: businessId: " + businessId)
                this.saveInvoices(accessToken, businessId, companyId, startDate, endDate);
            } else {
                this.saveInvoices(accessToken, businessId, companyId, startDate, endDate);
            }
        } catch (error) {
            logger.error("Items Failed:-" + error);
        }
    }

      /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveInvoices(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let Invoices = await myobDataReaderService.getAllInvoices(accessToken, companyId, startDate, endDate);

            if (Invoices) {
                let parsedInvoices = new InvoiceParser().parseInvoice(Invoices, businessId);
                
                this.prepareAndSendQueueData(EntityType.invoice_bill, OperationType.CREATE, businessId, parsedInvoices);
                logger.info("Invoices Fetched: businessId: " + businessId)
                this.saveBills(accessToken, businessId, companyId, startDate, endDate); 
            } else {
                this.saveBills(accessToken, businessId, companyId, startDate, endDate); 
            }
        } catch (error) {
            logger.error("Invoices Failed:-" + error);
        }
    }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveBills(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            console.log('STEP 2 Bills');
            
            // Call myob api to fetch customers
            let bills = await myobDataReaderService.getAllBills(accessToken, companyId, startDate, endDate);

            if (bills) {
                let parsedBills = new BillParser().parseBill(bills, businessId);
                
                this.prepareAndSendQueueData(EntityType.invoice_bill, OperationType.CREATE, businessId, parsedBills);
                logger.info("Bills Fetched: businessId: " + businessId)
                this.saveCustomerPayments(accessToken, businessId, companyId, startDate, endDate);  
            } else {
                this.saveCustomerPayments(accessToken, businessId, companyId, startDate, endDate);  
            }
        } catch (error) {
            logger.error("Bills Failed:-" + error);
        }
    }

    
       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveCustomerPayments(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let customerPayments = await myobDataReaderService.getAllCustomerPayments(accessToken, companyId, startDate, endDate);

            if (customerPayments) {
                let parsedCustomerPayments = new CustomerPaymentParser().parseCustomerPayment(customerPayments, businessId);
                
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedCustomerPayments);
                logger.info("Customer-Payment Fetched: businessId: " + businessId)
                this.saveSupplierPayments(accessToken, businessId, companyId, startDate, endDate); 
            } else {
                this.saveSupplierPayments(accessToken, businessId, companyId, startDate, endDate); 
            }
        } catch (error) {
            logger.error("Customer-Payment Failed:-" + error);
        }
    }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveSupplierPayments(accessToken: string, businessId:string, companyId: string, startDate:string, endDate:string) {
        try {
            
            // Call myob api to fetch customers
            let supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessToken, companyId, startDate, endDate);
            
            if (supplierPayments) {
                let parsedSupplierPayments = new SupplierPaymentParser().parseSupplierPayment(supplierPayments, businessId);
                
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedSupplierPayments);
                logger.info("Supplier-Payment Fetched: businessId: " + businessId)
            }
        } catch (error) {
            logger.error("Supplier-Payment Failed:-" + error);
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