const ServerError = require('../utils/ServerError')
const { processGetBalance } = require('../helpers/processManager')
const dbHelper = require('../db/dbHelper')
const { getBalanceActivityByFilter } = require('../sql/queries/balance')
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
  let resBalance = await dbHelper.executeQuery(getBalanceActivityByFilter({ filterBy }))
  return resBalance
}

module.exports = { getBalanceActivity }
