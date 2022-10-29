const ServerError = require('../utils/ServerError')
const { processGetBalance } = require('../helpers/processManager')

const { Errors } = require('../constants/Errors')

const Balance = require('../mongooseModels/balance')

const logger = require('../utils/Logger')

const getBalance = async (incomingMessage) => {
  const { data } = incomingMessage
  let processedData
  try {
    processedData = await processGetBalance(data)
  } catch (error) {
    const { status, message, systemMessage } = error
    throw new ServerError(
      Errors.QUEUE_MESSAGE_ERROR({
        errorMessage: message,
        code: status,
        systemMessage,
      })
    )
  }
  const balanceResult = await getBalanceFromDB({ filterBy: processedData })
  return { balance: balanceResult }
}

const getBalanceFromDB = async ({ filterBy }) => {
  const { limit, offset } = filterBy
  delete filterBy.limit
  delete filterBy.offset
  const result = await Balance.find(filterBy, null, { limit, skip: offset }).catch((error) => {
    logger.error(`[Mongo] Failed to fetch data from DB, error: ${error}`)
  })
  return result
}

module.exports = { getBalance }
