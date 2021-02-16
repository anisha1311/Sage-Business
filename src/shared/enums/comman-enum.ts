export enum EntityName {
    customer = 'Customer',
    vendor = 'Vendor',
    invoice = 'Invoice',
    account = 'Account',
    employee = 'Employee',
    bill = 'Bill',
    estimate = 'Estimate',
    creditMemo = 'CreditMemo',
    deposit = 'Deposit',
    purchaseOrder = 'PurchaseOrder',
    refundReceipt = 'RefundReceipt',
    salesReceipt = 'SalesReceipt',
    timeActivity = 'TimeActivity',
    transfer = 'Transfer',
    vendorCredit = 'VendorCredit',
    payment = 'Payment',
    journalEntry = 'JournalEntry',
    purchase = 'Purchase',
    billPayment = 'BillPayment',
}

export enum TimeZone {
    default = 'America/New_York'
}

export enum ServiceType {
    smaiMYOBService = 2
}

export enum DateFormat {
    dateTimeIso = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]',
    dateTime = 'YYYY-MM-DD HH:mm:ss',
    date = 'YYYY-MM-DD',
}
export enum TimeUnitKeys {

    minutes ='minutes',
    days = 'days',
    hours = 'hours',
    months = 'months'
}

export enum ReloadType {
    monthlyReload = 1,
    syncReload = 2,
    webhook = 3
}
export enum SingleSignOn {
    signIn = 1,
    signUp = 2,
}

