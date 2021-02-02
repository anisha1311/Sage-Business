
export const Constant = {

    commanResMsg: {
        modelInvalid: 'Request model is not valid',
        somethingWentWrong: 'Something went wrong',
        successfullyFetchedData:'Successfully fetched data.'
    },
    qbResMsg: {
        connectionUrl: 'Url created successfully',
        businessDisconnectFailed: 'Unable to disconnect business from Quickbooks Online',
        businessDisconnectSuccess: 'Business disconnected from qb successfully'
    },
    busResMsg: {
        addBusiness: 'Business Added successfully',
        createRefreshToken: 'New resfreh token created successfully',
        restoreBusiness: 'Business restore successfully',
        businessReload: 'Sync successful !',
        businessSaveFailed: 'Failed to save business',
        businessConnectFailed: 'Something went wrong while onboarding business',
        businessIdValidation: 'Business Id not provided',
        businessDisconnectFailed: 'Unable to disconnect business',
        businessNotFound: 'Unable to find businesss',
        smaiBusinessIdValidation: 'smaibusiness id is not string',
        accountTypeNotFound: 'Error Finding Account Type',
        noApAgingReportData: 'No AP Aging Report Data Provided',
        noArAgingReportData: 'No AR Aging Report Data Provided',
        noJouralReportsData: 'No Journal Reports or Journal Reports length is Zero',
        noTxnReportsData: 'No TxnReport Data Provided',
        noTrialBalanceReportData: 'No TrialBalance Data Provided',
        failedReload: 'Failed to sync business',
        duplicateBusiness: 'Business exist alreday. Reloaded business',
        updatedBusiness: 'Business already exists. Business updated successfully',
        invalidReload: 'Reload data is not valid',
        businessDataLoded: 'Business data loading process started',
        tokenExpiredOnReload: 'Unable to sync the business. Please reconnect.',
        tokenExpiredOnDiscnt:'Unable to disconnect this business. Please reconnect.',
    },
    commanConst: {
        disconneted: 'disconnected',
        rabbitMQRecieverConn: 'receiver-connection',
        rabbitMQSenderConn: 'sender-connection',
        accessTokenLeastMinutes: 4,
        smaiQbService: 'smai-myob-service',
        smaiBusinessService: 'smai-business-service',
        emptyQueueName: 'Empty data or new name Supplied',
        smaiClientGateway: 'smai-client-gateway',
        maxLengthDesc: 249
    },
    urlConstant: {

        QbUrl: {
            callback: process.env.QUICKBOOK_API_URL + '/api/qb/callback?state={0}&code={1}',
            callbackUser: process.env.QUICKBOOK_API_URL + '' + process.env.CALLBACK_USER_URL + '?state={0}&code={1}',
            companyInfo: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from CompanyInfo&minorversion=47',
            customers: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Customer STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            inactiveCustomers: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Customer where Active=false STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            chartOfAccounts: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Account STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            inactiveChartOfAccounts: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Account where Active=false STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            vendors: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from vendor STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            payment: process.env.QUICKBOOK_API_URL + "/v3/company/{0}/query?query=select * from Payment Where TxnDate>='{1}' AND TxnDate<='{2}' Order By Metadata.LastUpdatedTime STARTPOSITION 1 MAXRESULTS 1000&minorversion=47",
            billPayment: process.env.QUICKBOOK_API_URL + "/v3/company/{0}/query?query=select * from billpayment Where TxnDate>='{1}' AND TxnDate<='{2}' Order By Metadata.LastUpdatedTime STARTPOSITION 1 MAXRESULTS 1000&minorversion=47",
            inactiveVendors: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from vendor where Active=false STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            employee: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Employee STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            inactiveEmployee: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Employee where Active=false STARTPOSITION 1 MAXRESULTS 1000&minorversion=47',
            companyPreference: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from Preferences&minorversion=47',
            jvReports: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/reports/JournalReport?start_date={1}&end_date={2}&minorversion=47&columns=acct_num_with_extn,is_cleared,tx_date,debt_amt,doc_num,account_name,credit_amt,create_by,memo,txn_type,name',
            txnReports: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/reports/TransactionList?start_date={1}&end_date={2}&source_account_type=CreditCard,AccountsPayable,AccountsReceivable,Bank&columns=account_name,due_date,doc_num,is_no_post,name,other_account,tx_date,txn_type,subt_nat_home_amount,nat_home_open_bal,nat_open_bal,subt_nat_amount,memo&minorversion=47',
            trialBalance: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/reports/TrialBalance?start_date={1}&end_date={2}&minorversion=47',
            arAgingReport: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/reports/AgedReceivableDetail?report_date={1}&minorversion=47',
            apAgingReport: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/reports/AgedPayableDetail?report_date={1}&minorversion=47',
            jorunalEntries: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/query?query=select * from JournalEntry Where Metadata.LastUpdatedTime>{1} and Metadata.LastUpdatedTime<{2} Order By Metadata.LastUpdatedTime&minorversion=47',
            redirectUrlForSingleSignOn: process.env.QUICKBOOK_API_URL + '/api/qb/callback?state={0}&code={1}',
            cdcCoa: process.env.QUICKBOOK_API_URL + '/v3/company/{0}/cdc?entities=Account&changedSince={1}&minorversion=51',

        },
        serviceUrl: {
            businessUrl: process.env.SMAIBaseUrl + '/business/',
            accessTokenUrl: process.env.SMAIBaseUrl + '/api/credentials/realmid/{0}',
            coaUrl: process.env.SMAIBaseUrl + '/api/chartofaccounts/{0}',
            credentialInfo: process.env.SMAIBaseUrl + '/api/credentials',
            syncDate: process.env.SMAIBaseUrl + '/api/business/syncdate',
            businessDetails: process.env.SMAIBaseUrl + '/api/business/{0}/details',
            disconnectUrl: process.env.AUTH_BASE_URL + '/api/business/disconnect',
            disconnetBusinessServiceUrl: process.env.SMAIBaseUrl + '/api/business/disconnect/{0}/{1}',
            markBusinessStatus: process.env.SMAIBaseUrl + '/api/business/{0}/status/{1}',
            deleteBusiness: process.env.SMAIBaseUrl + '/api/business/delete-business-data',
            misDisconnectBusiness: process.env.MIS_SERVICE_URL + '/api/report/business/{0}/disconnect',
            login: process.env.AUTH_BASE_URL + '/api/users/login',
        },
        myobUrl : {            
            accountRight: process.env.MYOB_API_URL + '/accountright',
        }
    },
    parserMsg: {
        parseAccessTokenError: 'failed to parse Access Token data',
        parseAccountsError: 'failed to parse Chart of Accounts data',
        parseArAgingError: 'failed to parse AR AGING data',
        parseApAgingError: 'failed to parse AP AGING data',
        parseJvError: 'failed to parse JV data',
        parseTxnError: 'failed to parse Transactions data',
        parseTrialBalanceError: 'failed to parse TRIAL BALANCE data',
        parseContactErrror: 'failed to parse CONTACT data',
        parseBusinessData: 'failed to parse BUSINESS data'
    },
    commanParserConst: {
        blankZeroDate: '0-00-00',
        invalidDate: 'Invalid date'
    },
    qbDataGetFailError: {
        failedCompanyData: 'Failed to Load company data',
        failedCustomersData: 'Failed to Load customer data',
        failedJVData: 'Failed to Load Journal Reports data',
        failedTxnData: 'Failed to Load Transactions Reports data',
        failedTrialBalance: 'Failed to load trial balance data',
        failedArAgingDetail: 'Failed to Load ArAgingDetail',
        failedApAgingDetail: 'Failed to Load ApAgingDetail',
        failedChartOfAccounts: 'Failed to Load Chart of accounts data',
        failedVendors: 'Failed to Load Vendors',
        failedEmployee: 'Failed to Load Employee Data',
        failedCompanyPrefrence: 'Failed to Load Company preferences Data',
        failedDueDatesTxn: 'Failed due to dates in transactions reports',
        failedDueDatesJv: 'Failed due to dates in Jv reports',
        invalidGrant: "invalid_grant"

    }

}