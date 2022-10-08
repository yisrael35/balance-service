const { balance, balanceActivity, currency, user, supplier, client } = require('../../constants/DatabaseTables').DatabaseTables

const getBalanceByFilter = ({ filterBy }) => {
  const { type, currencyId, supplierId, clientId, userId } = filterBy
  return `
  SELECT 
  b.uuid AS id,
  c.code AS currency,
  b.type,
  u.last_name AS user,
  s.name AS supplier,
  cl.name AS client,
  b.amount,
  b.created_at,
  b.updated_at
  FROM ${balance.TABLE_NAME} b
  JOIN ${currency.TABLE_NAME} c ON c.${currency.ID} = b.${balance.CURRENCY_ID} 
  LEFT JOIN ${user.TABLE_NAME} u ON u.${user.ID} = b.${balance.USER_ID} 
  LEFT JOIN ${supplier.TABLE_NAME} s ON s.${supplier.ID} = b.${balance.SUPPLIER_ID} 
  LEFT JOIN ${client.TABLE_NAME} cl ON cl.${client.ID} = b.${balance.CLIENT_ID} 
  WHERE 
  ${currencyId ? `b.${balance.CURRENCY_ID} = '${currencyId}' AND` : ''}
  ${supplierId ? `b.${balance.SUPPLIER_ID} = '${supplierId}' AND` : ''}
  ${clientId ? `b.${balance.CLIENT_ID} = '${clientId}' AND` : ''}
  ${userId ? `b.${balance.USER_ID} = '${userId}' AND` : ''}
  ${type ? `b.${balance.TYPE} = '${type}' AND` : ''}
  1 = 1
  ;`
}

const getBalanceActivityByFilter = ({ filterBy }) => {
  const { type, currencyId, supplierId, clientId, userId, transactionId, limit, offset } = filterBy
  return `
  SELECT 
  b.uuid AS id,
  c.code AS currency,
  b.type,
  u.last_name AS user,
  s.name AS supplier,
  cl.name AS client,
  b.amount,
  b.old_amount,
  b.new_amount,
  b.created_at
  FROM ${balanceActivity.TABLE_NAME} b
  JOIN ${currency.TABLE_NAME} c ON c.${currency.ID} = b.${balanceActivity.CURRENCY_ID} 
  LEFT JOIN ${user.TABLE_NAME} u ON u.${user.ID} = b.${balanceActivity.USER_ID} 
  LEFT JOIN ${supplier.TABLE_NAME} s ON s.${supplier.ID} = b.${balanceActivity.SUPPLIER_ID} 
  LEFT JOIN ${client.TABLE_NAME} cl ON cl.${client.ID} = b.${balanceActivity.CLIENT_ID} 
  WHERE 
  ${currencyId ? `b.${balanceActivity.CURRENCY_ID} = '${currencyId}' AND` : ''}
  ${supplierId ? `b.${balanceActivity.SUPPLIER_ID} = '${supplierId}' AND` : ''}
  ${clientId ? `b.${balanceActivity.CLIENT_ID} = '${clientId}' AND` : ''}
  ${transactionId ? `b.${balanceActivity.CLIENT_ID} = '${transactionId}' AND` : ''}
  ${userId ? `b.${balanceActivity.USER_ID} = '${userId}' AND` : ''}
  ${type ? `b.${balanceActivity.TYPE} = '${type}' AND` : ''}
  1 = 1
  LIMIT ${limit} OFFSET ${offset}
  ;`
}

const getLastBalance = ({ filterBy }) => {
  const { type, currencyId, supplierId, clientId, userId } = filterBy
  return `
  SELECT 
  *
  FROM ${balance.TABLE_NAME} 
  WHERE 
  ${currencyId ? `${balance.CURRENCY_ID} = '${currencyId}' AND` : ''}
  ${supplierId ? `${balance.SUPPLIER_ID} = '${supplierId}' AND` : ''}
  ${clientId ? `${balance.CLIENT_ID} = '${clientId}' AND` : ''}
  ${userId ? `${balance.USER_ID} = '${userId}' AND` : ''}
  ${type ? `${balance.TYPE} = '${type}' AND` : ''}
  1 = 1
  ;`
}

const create = (tableName, data) => {
  return `
  INSERT INTO ${tableName} (${Object.keys(data)})
  VALUES (${Object.values(data).map((key) => '?')});`
}

const updateBalanceUser = (data, id, currency_id) => {
  return `
  UPDATE ${balance.TABLE_NAME} 
  SET ${Object.keys(data).map((key) => `${key} = ? `)}
  WHERE user_id = '${id}' AND currency_id = '${currency_id}';`
}
const updateBalanceClient = (data, id, currency_id) => {
  return `
  UPDATE ${balance.TABLE_NAME} 
  SET ${Object.keys(data).map((key) => `${key} = ? `)}
  WHERE client_id = '${id}' AND currency_id = '${currency_id}';`
}
const updateBalanceSupplier = (data, id, currency_id) => {
  return `
  UPDATE ${balance.TABLE_NAME} 
  SET ${Object.keys(data).map((key) => `${key} = ? `)}
  WHERE supplier_id = '${id}' AND currency_id = '${currency_id}';`
}

const lockBalance = () => {
  return `
  LOCK TABLES 
  ${balance.TABLE_NAME} WRITE
  ;`
}

const unlockTables = () => {
  return `
  UNLOCK TABLES;`
}

module.exports = {
  getBalanceByFilter,
  getBalanceActivityByFilter,
  getLastBalance,
  create,
  updateBalanceUser,
  updateBalanceClient,
  updateBalanceSupplier,
  lockBalance,
  unlockTables,
}
