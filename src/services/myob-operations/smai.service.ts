import { HTTPService } from '@shared/http-service';
import { CustomerParser } from 'src/parsers/customer';
import { CompanyParser } from 'src/parsers/company';
import { VendorParser } from 'src/parsers/vendor';
import { ContactParser } from 'src/parsers/contact';
import { ItemParser } from 'src/parsers/item';
import { InvoiceParser } from 'src/parsers/invoice';
import { BillParser } from 'src/parsers/bill';
import { EmployeeParser } from 'src/parsers/employee';
import { QuickbooksConnectionService } from 'src/services/myob-operations/myob-connection.service';
import { QuickbooksDataReaderService } from 'src/services/myob-operations/myob-data-reader.service';
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
const quickbooksDataReaderService = new QuickbooksDataReaderService();
const quickbookConnectionService = new QuickbooksConnectionService();

let apisvc = new CommanAPIService() 
const reloadsbc = new MonthlReloadService()

export class SmaiBusinessService {

    /**
     * will post add Business Info to smai-Business-service
     * @param callbackString 
     * @param realmId 
     * @param userid 
     * @param timezone 
     */
    async saveBusiness(callbackString: string) {
        try {
            // Get access token from myob
            const accessTokens = await quickbookConnectionService.getTokens(callbackString);
           console.log('accessTokens', accessTokens);
           
            // Fetch companies to get the businessId
            let companyInfo = await quickbooksDataReaderService.getCompanyInfo(accessTokens.access_token);
          
            // Fetch company information
            for(var index=0; index<companyInfo.length;index++){
                console.log('realmId >>', companyInfo[index].Id);
                this.saveCompanyData(accessTokens.access_token, companyInfo[index].Uri, companyInfo[index].Id);
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
         this.saveCustomers(accessToken, calloutUri, businessId);
         this.saveVendors(accessToken, calloutUri, businessId);
         this.saveContacts(accessToken, calloutUri, businessId);
         this.saveEmployees(accessToken, calloutUri, businessId);
         this.saveAccounts(accessToken, calloutUri, businessId);
         this.saveItems(accessToken, calloutUri, businessId);
         this.saveInvoices(accessToken, calloutUri, businessId);
    }
 
    /**
     * Will parse and get customer
     * @param accessToken 
     * @param calloutUri 
     * @param businessId 
     */
     async saveCustomers(accessToken: string, calloutUri: string, businessId:string) {
        try {
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let customers = await quickbooksDataReaderService.getAllCustomers(accessToken, calloutUri);
            console.log('customers', customers);
        

            if (customers) {
                let parsedCustomers = new CustomerParser().parseCustomer(customers, businessId);
                console.log('parsedCustomers', parsedCustomers);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let vendors = await quickbooksDataReaderService.getAllSuppliers(accessToken, calloutUri);
            console.log('vendors', vendors);

            if (vendors) {
                let parsedVendors = new VendorParser().parseVendor(vendors, businessId);
                console.log('parsedVendors', parsedVendors);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let contacts = await quickbooksDataReaderService.getAllContacts(accessToken, calloutUri);
            console.log('contacts', contacts);

            if (contacts) {
                let parsedContacts = new ContactParser().parseContact(contacts, businessId);
                console.log('parsedContacts', parsedContacts);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let employees = await quickbooksDataReaderService.getAllEmployees(accessToken, calloutUri);
            console.log('employees', employees);

            if (employees) {
                let parsedEmployees = new EmployeeParser().parseEmployee(employees, businessId);
                console.log('parsedEmployees', parsedEmployees);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let accounts = await quickbooksDataReaderService.getAllAccounts(accessToken, calloutUri);
            console.log('accounts', accounts);

            if (accounts) {
                let parsedAccounts = new ChartOfAccountParser().parseChartofAccounts(accounts, businessId);
                console.log('parsedAccounts', parsedAccounts);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let items = await quickbooksDataReaderService.getAllItems(accessToken, calloutUri);
            console.log('items', items);

            if (items) {
                let parsedItems = new ItemParser().parseItem(items, businessId);
                console.log('parsedItems', parsedItems);
                
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let Invoices = await quickbooksDataReaderService.getAllInvoices(accessToken, calloutUri);
            console.log('Invoices', Invoices);

            if (Invoices) {
                let parsedInvoices = new InvoiceParser().parseInvoice(Invoices, businessId);
                console.log('parsedInvoices', parsedInvoices);
                
                this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, parsedInvoices);
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
            let allCustomers: any[] = [];
            // Call myob api to fetch customers
            let bills = await quickbooksDataReaderService.getAllBills(accessToken, calloutUri);
            console.log('bills', bills);

            if (bills) {
                let parsedBills = new BillParser().parseBill(bills, businessId);
                console.log('parsedBills', parsedBills);
                
                this.prepareAndSendQueueData(EntityType.invoice, OperationType.CREATE, businessId, parsedBills);
                logger.info("Bills Fetched: businessId: " + businessId)
            }
        } catch (error) {
            logger.error("Bills Failed:-" + error);
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
        console.log('queueData', queueData);

        QueueHandler.sendMessage(process.env.QUEUE_NAME, queueData);
    }
}