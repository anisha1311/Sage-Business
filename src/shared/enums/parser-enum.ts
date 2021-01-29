export enum ApArAgingParserKeys {
    txDate = 'tx_date',
    txnType = 'txn_type',
    docNum = 'doc_num',
    vendName = 'vend_name',
    custName = 'cust_name',
    dueDate = 'due_date',
    subtNegHomeAmount = 'subt_neg_home_amount',
    subtNegAmount = 'subt_neg_amount',
    subtNegHomeOpenBal = 'subt_neg_home_open_bal',
    subtNegOpenBal = 'subt_neg_open_bal',
    subtHomeAmount = 'subt_home_amount',
    subtAmount= 'subt_amount',
    subtHomeOpenBal='subt_home_open_bal',
    subtOpenBal = 'subt_open_bal'
}

export enum JournalReportTxnReportKeys {
    txDate = 'tx_date',
    txnType = 'txn_type',
    docNum = 'doc_num',
    name = 'name',
    memo = 'memo',
    debtAmt = 'debt_amt',
    creditAmt = 'credit_amt',
    accountName = 'account_name',
    isCleared = 'is_cleared',
    asset ='Asset',
    expense = 'Expense',
    liability = 'Liability',
    equity ='Equity',
    revenue = 'Revenue',
    otherAccount = 'other_account',
    subtNatAmount = 'subt_nat_amount',
    subtNatHomeAmount = 'subt_nat_home_amount',
    dueDate = 'due_date',
    natHomeOpenBal = 'nat_home_open_bal',
    natOpenBal = 'nat_open_bal',
    accountsPayable = 'Accounts Payable',
    accountsRecievable = 'Accounts Receivable',
    bank = 'Bank',
    creditCard = 'Credit Card'
}

export enum TrialBalanceKeys {
    account = 'Account',
    debit = 'Debit',
    credit = 'Credit'
}

export enum ChartOfAccountKeys {
    income = 'Income',
    expense = 'Expense',
    otherIncome = 'Other Income',
    otherExpense = 'Other Expense'
}