const ServerError = require('../utils/ServerError')
const { processUpdateTransactionBalance } = require('../helpers/processManager')
const { Errors } = require('../constants/Errors')
const logger = require('../utils/Logger')
const Balance = require('../mongooseModels/balance')
const BalanceActivity = require('../mongooseModels/balanceActivity')

const updateBalanceByTransaction = async (incomingMessage) => {
  const { data } = incomingMessage

  let processedData
  try {
    processedData = await processUpdateTransactionBalance(data)
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
  const { amount, currency, user, supplier, client, type, transaction } = processedData

  const balanceResult = await CalcAndUpdateNewBalance({ amount, currency, user, supplier, client, type })
  const balanceActivity = new BalanceActivity({
    type,
    user,
    supplier,
    client,
    currency,
    transaction,
    amount,
    oldAmount: balanceResult.oldAmount,
    newAmount: balanceResult.newAmount,
  })

  insertBalanceActivity(balanceActivity)
  return { balance: balanceResult.newBalance }
}

const CalcAndUpdateNewBalance = async ({ amount, currency, user, supplier, client, type }) => {
  try {
    // lock table

    let oldAmount = 0
    let newAmount = amount
    const filterBy = { currency, user, supplier, client, type }
    // get last balance and calculate a new one
    await Balance.findOne(filterBy)
      .then(async (result) => {
        if (result === null) {
          const balance = new Balance({ amount, currency, user, supplier, client, type })
          await balance
            .save()
            .then((data) => {
              logger.info(`[Mongo] balance save successfully, with data: ${JSON.stringify(data)}`)
            })
            .catch((error) => {
              logger.error(`[Mongo] failed to save balance, error: ${error}`)
            })
        } else {
          oldAmount = result ? Number(result.amount) : 0
          newAmount = Number(oldAmount + amount)
          await Balance.updateOne({ amount: newAmount, currency, user, supplier, client, type })
            .then((data) => {
              logger.info(`[Mongo] balance update with data: ${JSON.stringify(data)}`)
            })
            .catch((error) => {
              logger.error(`[Mongo] failed to update balance, error: ${error}`)
            })
        }
      })
      .catch((error) => {
        logger.error(`[Mongo] Failed to fetch data from DB, error: ${error}`)
      })
    return {
      oldAmount,
      newAmount,
    }
  } catch (error) {
    logger.log(error)
    const { sqlMessage, errorMessage, status } = error
    throw new ServerError(Errors.BALANCE_UPDATE_FAILED({ errorMessage, systemMessage: sqlMessage, code: status }))
  }
}

const insertBalanceActivity = async (balanceActivity) => {
  try {
    await balanceActivity
      .save()
      .then((data) => {
        logger.info(`[Mongo] balanceActivity save successfully, with data: ${JSON.stringify(data)}`)
      })
      .catch((error) => {
        logger.error(`[Mongo] failed to save balanceActivity, error: ${error}`)
      })
  } catch (error) {
    logger.error(error)
  }
}

module.exports = { updateBalanceByTransaction }
