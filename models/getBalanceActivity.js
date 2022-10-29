const ServerError = require('../utils/ServerError')
const { processGetBalance } = require('../helpers/processManager')
const BalanceActivity = require('../mongooseModels/balanceActivity')

const { Errors } = require('../constants/Errors')

const getBalanceActivity = async (incomingMessage) => {
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
  const balanceActivityResult = await getBalanceActivityFromDB({ filterBy: processedData })
  return { balanceActivity: balanceActivityResult }
}

const getBalanceActivityFromDB = async ({ filterBy }) => {
  const { limit, offset } = filterBy
  delete filterBy.limit
  delete filterBy.offset

  const result = await BalanceActivity.find(filterBy, null, { limit, skip: offset }).catch((error) => {
    logger.error(`[Mongo] Failed to fetch data from DB, error: ${error}`)
  })
  return result
}

module.exports = { getBalanceActivity }
