const dbHelper = require('../db/dbHelper')
const { getByID } = require('../sql/queries/processManager')
const ServerError = require('../utils/ServerError')
const { Errors } = require('../constants/Errors')
const { isNumber } = require('lodash')
const { user, currency, supplier, client, transaction } = require('../constants/DatabaseTables').DatabaseTables

const DEFAULT_LIMIT = 30
const DEFAULT_OFFSET = 0

const processUpdateTransactionBalance = async (payload) => {
  const items = ['type', 'amount', 'currency_id', 'transaction_id']
  if (!checkForRequiredFields({ items, payload })) {
    const errorMessage = `Missing fields, required fields: (${items})`
    throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
  }

  if (!payload.user_id && !payload.client_id && !payload.supplier_id) {
    const errorMessage = `Missing fields, required fields: (${items}, "user_id / client_id / supplier_id" )`
    throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
  }

  const processedData = {}
  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined) {
      switch (key) {
        case 'type': {
          if (val !== 'owner' && val !== 'client' && val !== 'supplier') {
            const errorMessage = `'${key}' property should be a owner/client/supplier not ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
          }
          processedData.type = val
          break
        }
        case 'amount': {
          if (!isNumber(val)) {
            const errorMessage = `'${key}' property should be a number not ${typeof val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
          }
          processedData.amount = val
          break
        }
        case 'currency_id': {
          const [resCurrency] = await dbHelper.executeQuery(getByID(currency.TABLE_NAME, val))
          if (!resCurrency) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.currencyId = val
          break
        }
        case 'transaction_id': {
          const [resTransaction] = await dbHelper.executeQuery(getByID(transaction.TABLE_NAME, val))
          if (!resTransaction) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.transactionId = val
          break
        }
        case 'user_id': {
          const [resUser] = await dbHelper.executeQuery(getByID(user.TABLE_NAME, val))
          if (!resUser) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.userId = val
          break
        }
        case 'client_id': {
          const [resClient] = await dbHelper.executeQuery(getByID(client.TABLE_NAME, val))
          if (!resClient) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.clientId = val
          break
        }
        case 'supplier_id': {
          const [resSupplier] = await dbHelper.executeQuery(getByID(supplier.TABLE_NAME, val))
          if (!resSupplier) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.supplierId = val
          break
        }
        default: {
          const errorMessage = `'${key}' property is not allowed in the request!`
          throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
        }
      }
    }
  }
  return processedData
}

const processGetBalance = async (payload) => {
  const items = ['type']
  if (!checkForRequiredFields({ items, payload })) {
    const errorMessage = `Missing fields, required fields: (${items})`
    throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
  }
  const processedData = {}
  processedData.limit = DEFAULT_LIMIT
  processedData.offset = DEFAULT_OFFSET

  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined) {
      switch (key) {
        case 'type': {
          if (val !== 'owner' && val !== 'client' && val !== 'supplier') {
            const errorMessage = `'${key}' property should be a owner/client/supplier not ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
          }
          processedData.type = val
          break
        }
        case 'currency_id': {
          const [resCurrency] = await dbHelper.executeQuery(getByID(currency.TABLE_NAME, val))
          if (!resCurrency) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.currencyId = val
          break
        }
        case 'user_id': {
          const [resUser] = await dbHelper.executeQuery(getByID(user.TABLE_NAME, val))
          if (!resUser) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.userId = val
          break
        }
        case 'client_id': {
          const [resClient] = await dbHelper.executeQuery(getByID(client.TABLE_NAME, val))
          if (!resClient) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.clientId = val
          break
        }
        case 'supplier_id': {
          const [resSupplier] = await dbHelper.executeQuery(getByID(supplier.TABLE_NAME, val))
          if (!resSupplier) {
            const errorMessage = `'${key}' property has no match to: ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 404 }))
          }
          processedData.supplierId = val
          break
        }
        case 'limit': {
          if (!isNumber(val) || val < 0 || val > 10_000) {
            const errorMessage = `'${key}' property should be a number between 1 - 10_000, not ${val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
          }
          processedData.limit = val
          break
        }
        case 'offset': {
          if (!isNumber(val) || val < 0) {
            const errorMessage = `'${key}' property should be a positive number not ${typeof val}`
            throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
          }
          processedData.offset = val
          break
        }
        default: {
          const errorMessage = `'${key}' property is not allowed in the request!`
          throw new ServerError(Errors.PROCESS_ERROR({ errorMessage, code: 400 }))
        }
      }
    }
  }
  return processedData
}

const checkForRequiredFields = ({ items, payload }) => {
  if (!payload) {
    return false
  }
  for (const item of items) {
    if (payload[item] === undefined) {
      return false
    }
  }
  return true
}

module.exports = {
  processUpdateTransactionBalance,
  processGetBalance,
}
