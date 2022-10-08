const ServerError = require('../utils/ServerError')
const { processGetBalance } = require('../helpers/processManager')
const dbHelper = require('../db/dbHelper')
const { getLastProviderBalance, getBalanceByFilter } = require('../sql/queries/balance')
const { Errors } = require('../constants/Errors')

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
  let resBalance = await dbHelper.executeQuery(getBalanceByFilter({ filterBy }))
  return resBalance
}

module.exports = { getBalance }
