const ServerError = require('../utils/ServerError')
const { Errors } = require('../constants/Errors')
const { isNumber } = require('lodash')
const logger = require('../utils/Logger')

const User = require('../mongooseModels/user')
const Supplier = require('../mongooseModels/supplier')
const Client = require('../mongooseModels/client')
const Currency = require('../mongooseModels/currency')
const Transaction = require('../mongooseModels/transaction')

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
        case 'transaction_id': {
          processedData.transaction = await getTransactionId(val)
          break
        }
        case 'currency_id': {
          processedData.currency = await getCurrencyId(val)
          break
        }
        case 'user_id': {
          processedData.user = await getUserId(val)
          break
        }
        case 'client_id': {
          processedData.client = await getClientId(val)
          break
        }
        case 'supplier_id': {
          processedData.supplier = await getSupplierId(val)
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
          processedData.currency = await getCurrencyId(val)
          break
        }
        case 'user_id': {
          processedData.user = await getUserId(val)
          break
        }
        case 'client_id': {
          processedData.client = await getClientId(val)
          break
        }
        case 'supplier_id': {
          processedData.supplier = await getSupplierId(val)
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

const getCurrencyId = async (val) => {
  let _id
  await Currency.find({ id: val })
    .then((data) => {
      if (!data.length) {
        const currency = new Currency({ id: val })
        currency
          .save()
          .then((data) => {
            logger.info(`[Mongo] currency save with data: ${data}`)
            _id = data._id
          })
          .catch((error) => {
            logger.error(`[Mongo] failed to save currency, error: ${error}`)
          })
      } else {
        logger.info(`[Mongo] found currency data: ${data}`)
        _id = data[0]._id
      }
    })
    .catch((error) => {
      logger.error(`[Mongo] failed to get currency, error: ${error}`)
    })
  return _id
}

const getSupplierId = async (val) => {
  let _id
  await Supplier.find({ id: val })
    .then((data) => {
      if (!data.length) {
        const supplier = new Supplier({ id: val })
        supplier
          .save()
          .then((data) => {
            logger.info(`[Mongo] supplier save with data: ${data}`)
            _id = data._id
          })
          .catch((error) => {
            logger.error(`[Mongo] failed to save supplier, error: ${error}`)
          })
      } else {
        logger.info(`[Mongo] found supplier data: ${data}`)
        _id = data[0]._id
      }
    })
    .catch((error) => {
      logger.error(`[Mongo] failed to get supplier, error: ${error}`)
    })
  return _id
}

const getTransactionId = async (val) => {
  let _id
  await Transaction.find({ id: val })
    .then((data) => {
      if (!data.length) {
        const transaction = new Transaction({ id: val })
        transaction
          .save()
          .then((data) => {
            logger.info(`[Mongo] transaction save with data: ${data}`)
            _id = data._id
          })
          .catch((error) => {
            logger.error(`[Mongo] failed to save transaction, error: ${error}`)
          })
      } else {
        logger.info(`[Mongo] found transaction data: ${data}`)
        _id = data[0]._id
      }
    })
    .catch((error) => {
      logger.error(`[Mongo] failed to get transaction, error: ${error}`)
    })
  return _id
}

const getUserId = async (val) => {
  let _id
  await User.find({ id: val })
    .then((data) => {
      if (!data.length) {
        const user = new User({ id: val })
        user
          .save()
          .then((data) => {
            logger.info(`[Mongo] user save with data: ${data}`)
            _id = data._id
          })
          .catch((error) => {
            logger.error(`[Mongo] failed to save user, error: ${error}`)
          })
      } else {
        logger.info(`[Mongo] found user data: ${data}`)
        _id = data[0]._id
      }
    })
    .catch((error) => {
      logger.error(`[Mongo] failed to get user, error: ${error}`)
    })
  return _id
}

const getClientId = async (val) => {
  let _id
  await Client.find({ id: val })
    .then((data) => {
      if (!data.length) {
        const client = new Client({ id: val })
        client
          .save()
          .then((data) => {
            logger.info(`[Mongo] client save with data: ${data}`)
            _id = data._id
          })
          .catch((error) => {
            logger.error(`[Mongo] failed to save client, error: ${error}`)
          })
      } else {
        logger.info(`[Mongo] found client data: ${data}`)
        _id = data[0]._id
      }
    })
    .catch((error) => {
      logger.error(`[Mongo] failed to get client, error: ${error}`)
    })
  return _id
}

module.exports = {
  processUpdateTransactionBalance,
  processGetBalance,
}
