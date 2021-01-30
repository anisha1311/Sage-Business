/**
 * Entity Type , used in Queue MetaDeta
 */
export enum EntityType {
    contact = "CONTACT",
    account = "ACCOUNT",
    item = "ITEM", //added by anisha
    invoice = "INVOICE", //added by anisha
    jv = "JOURNAL",
    trialBalance = "BUSINESS_TRIAL_BALANCES",
    arAging = "AR_RECEIVABLE",
    apAging = "AP_PAYABLE",
    transactions = "BUSINESS_TRANSACTION",
    payments = "BUSINESS_PAYMENTS",
    webhookJvTransactionCombine = "WEBHOOK_JV_TRANSACTION_COMBINE",
    webhookAccount = "WEBHOOK_ACCOUNT",
    qbError= 'QUEUE_ERROR',
    loadPreviousBusinessTxns ='LOAD_BUSINESS_TRANSACTION_PREVIOUS_DATA',
    loadPreviousJournal ='LOAD_JOURNAL_PREVIOUS_DATA',
    loadPreviousTrialBalance = 'LOAD_TRIAL_BALANCES_PREVIOUS_DATA',
    loadPreviousBusinessPayments = 'LOAD_BUSINESS_PAYMENTS_PREVIOUS_DATA'
}