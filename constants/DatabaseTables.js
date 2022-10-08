const DatabaseTables = {
  user: {
    TABLE_NAME: 'user',
    ID: 'id',
  },
  supplier: {
    TABLE_NAME: 'supplier',
    ID: 'id',
  },
  client: {
    TABLE_NAME: 'client',
    ID: 'id',
  },
  transaction: {
    TABLE_NAME: 'transaction',
    ID: 'id',
  },
  currency: {
    TABLE_NAME: 'currency',
    ID: 'id',
    CODE: 'code',
  },
  transaction: {
    TABLE_NAME: 'transaction',
    ID: 'id',
    CURRENCY_ID: 'currency_id',
    AMOUNT: 'amount',
    STATUS: 'status',
    DIRECTION: 'direction',
  },
  balance: {
    TABLE_NAME: 'balance',
    TYPE: 'type',
    CURRENCY_ID: 'currency_id',
    AMOUNT: 'amount',
    CLIENT_ID: 'client_id',
    SUPPLIER_ID: 'supplier_id',
    USER_ID: 'user_id',
  },
  balanceActivity: {
    TABLE_NAME: 'balance_activity',
    CURRENCY_ID: 'currency_id',
    TYPE: 'type',
    TRANSACTION_ID: 'transaction_id',
    OLD_AMOUNT: 'old_amount',
    NEW_AMOUNT: 'new_amount',
    AMOUNT: 'amount',
    CLIENT_ID: 'client_id',
    SUPPLIER_ID: 'supplier_id',
    USER_ID: 'user_id',
  },
}

module.exports = {
  DatabaseTables,
}
