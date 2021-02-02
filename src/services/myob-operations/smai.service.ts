import { HTTPService } from '@shared/http-service';
import { CustomerParser } from 'src/parsers/customer';
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

const httpService = new HTTPService()
const myobDataReaderService = new MyobDataReaderService();
const myobConnectionService = new MyobConnectionService();

let apisvc = new CommanAPIService() 
const reloadsbc = new MonthlReloadService()

export class SmaiBusinessService {
    public  access_token:string='';
    public  refresh_token:string='';

    /**
     * will post add Business Info to smai-Business-service
     * @param callbackString 
     * @param realmId 
     * @param userid 
     * @param timezone 
     */
    async saveBusiness(callbackString: string, access_token : string, refresh_token : string, timezone : string) {
        try {
            let accessTokens:any = {};
            if(callbackString!=='false')
            {                
                // Get access token from sage business cloud
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
            for(var index=0; index<companyInfo.length;index++){
                console.log('length', companyInfo.length);
            
                 let parsedCompany = CompanyParser.parseCompany(companyInfo);
                 let companyAddress = CompanyParser.parseCompanyAddress(companyInfo);
                 let parsedAccessToken = AccessTokenParser.parseAccessTokens(accessTokens);
                let requestBody = {
                    "business": parsedCompany,
                    "address": companyAddress,
                    "token": parsedAccessToken
                }
                
                let response = await httpService.post(Constant.urlConstant.serviceUrl.businessUrl, JSON.stringify(requestBody))
         
                this.saveCompanyData(this.access_token, companyInfo[index].Uri, response.data.data.id);
            }
         
        } catch (error) {
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
    saveCompanyData(accessToken: string, calloutUri: string, businessId: string) {        
        // this.saveCustomers(accessToken, calloutUri, businessId);
        // this.saveVendors(accessToken, calloutUri, businessId);
        this.saveEmployees(accessToken, calloutUri, businessId);
        // this.saveAccounts(accessToken, calloutUri, businessId);
        // this.saveItems(accessToken, calloutUri, businessId); 
        // this.saveInvoices(accessToken, calloutUri, businessId);
        // this.saveBills(accessToken, calloutUri, businessId); 
        // this.saveCustomerPayments(accessToken, calloutUri, businessId);  
        // this.saveSupplierPayments(accessToken, calloutUri, businessId); 
    }
 
    /**
     * Will parse and get customer
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
     async saveCustomers(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let customers = await myobDataReaderService.getAllCustomers(accessToken, calloutUri);        

            if (customers) {
                let parsedCustomers = new CustomerParser().parseCustomer(customers, businessId);
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedCustomers);
                logger.info("Customers Fetched: businessId: " + businessId)
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
    async saveVendors(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let vendors = await myobDataReaderService.getAllSuppliers(accessToken, calloutUri);

            if (vendors) {
                let parsedVendors = new VendorParser().parseVendor(vendors, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedVendors);
                logger.info("Vendors Fetched: businessId: " + businessId)
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
    async saveContacts(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let contacts = await myobDataReaderService.getAllContacts(accessToken, calloutUri);

            if (contacts) {
                let parsedContacts = new ContactParser().parseContact(contacts, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedContacts);
                logger.info("Contacts Fetched: businessId: " + businessId)
            }
        } catch (error) {
            logger.error("Contacts Failed:-" + error);
        }
    }

       /**
     * Will parse and get contact
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
    async saveEmployees(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let employees = await myobDataReaderService.getAllEmployees(accessToken, calloutUri);

            if (employees) {
                let parsedEmployees = new EmployeeParser().parseEmployee(employees, businessId);
                
                this.prepareAndSendQueueData(EntityType.contact, OperationType.CREATE, businessId, parsedEmployees);
                logger.info("Employees Fetched: businessId: " + businessId)
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
    async saveAccounts(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let accounts = await myobDataReaderService.getAllAccounts(accessToken, calloutUri);

            if (accounts) {
                let parsedAccounts = new ChartOfAccountParser().parseChartofAccounts(accounts, businessId);
                
                this.prepareAndSendQueueData(EntityType.account, OperationType.CREATE, businessId, parsedAccounts);
                logger.info("Accounts Fetched: businessId: " + businessId)
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
    async saveItems(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let items = await myobDataReaderService.getAllItems(accessToken, calloutUri);

            if (items) {
                let parsedItems = new ItemParser().parseItem(items, businessId);
                
                this.prepareAndSendQueueData(EntityType.item, OperationType.CREATE, businessId, parsedItems);
                logger.info("Items Fetched: businessId: " + businessId)
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
    async saveInvoices(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let Invoices = await myobDataReaderService.getAllInvoices(accessToken, calloutUri);

            if (Invoices) {
                let parsedInvoices = new InvoiceParser().parseInvoice(Invoices, businessId);
                
                this.prepareAndSendQueueData(EntityType.invoice_bill, OperationType.CREATE, businessId, parsedInvoices);
                logger.info("Invoices Fetched: businessId: " + businessId)
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
    async saveBills(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let bills = await myobDataReaderService.getAllBills(accessToken, calloutUri);

            if (bills) {
                let parsedBills = new BillParser().parseBill(bills, businessId);
                
                this.prepareAndSendQueueData(EntityType.invoice_bill, OperationType.CREATE, businessId, parsedBills);
                logger.info("Bills Fetched: businessId: " + businessId)
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
    async saveCustomerPayments(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let customerPayments = await myobDataReaderService.getAllCustomerPayments(accessToken, calloutUri);

            if (customerPayments) {
                let parsedCustomerPayments = new CustomerPaymentParser().parseCustomerPayment(customerPayments, businessId);
                
                this.prepareAndSendQueueData(EntityType.payments, OperationType.CREATE, businessId, parsedCustomerPayments);
                logger.info("Customer-Payment Fetched: businessId: " + businessId)
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
    async saveSupplierPayments(accessToken: string, calloutUri: string, businessId:string) {
        try {
            
            // Call myob api to fetch customers
            let supplierPayments = await myobDataReaderService.getAllSupplierPayments(accessToken, calloutUri);
            
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