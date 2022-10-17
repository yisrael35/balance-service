const ServerError = require('../utils/ServerError')
const { processUpdateTransactionBalance } = require('../helpers/processManager')
const logger = require('../utils/Logger')
const dbHelper = require('../db/dbHelper')
const { Errors } = require('../constants/Errors')
const { balanceActivity: balanceActivityTable } = require('../constants/DatabaseTables').DatabaseTables
const { create } = require('../sql/queries/balance')
const REDIS_GROUP_BALANCE = process.env.REDIS_GROUP_BALANCE
const redis_group = require('../redis/redisGroup')

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
  const { amount, currencyId, userId, supplierId, clientId, type, transactionId } = processedData

  const balanceResult = await CalcAndUpdateNewBalance({ amount, currencyId, userId, supplierId, clientId, type })
  const balanceActivity = {
    type,
    user_id: userId,
    supplier_id: supplierId,
    client_id: clientId,
    currency_id: currencyId,
    transaction_id: transactionId,
    amount,
    old_amount: balanceResult.oldAmount,
    new_amount: balanceResult.newAmount,
  }

  insertBalanceActivity({ balanceActivity })
  return { balance: balanceResult.newBalance }
}

const CalcAndUpdateNewBalance = async ({ amount, currencyId, userId, supplierId, clientId, type }) => {
  const key = `${type}:${userId || supplierId || clientId}:${currencyId}`
  try {
    logger.warn(`[Redis] Trying to insert/update balance, key: ${key}, amount: ${amount} to Redis`)

    redisResult = await redis_group.updateBalance(REDIS_GROUP_BALANCE, key, amount)
    const { key: redisKey, oldAmount, newAmount } = redisResult
    logger.info(`[Redis] key: ${redisKey}, Old Amount: ${oldAmount || 0}, new Amount: ${newAmount} updated in Redis successfully`)
    return {
      oldAmount: redisResult.oldAmount || 0,
      newAmount: redisResult.newAmount,
    }
  } catch (error) {
    logger.error(`[Redis] Error: ${error}, Failed to insert to Redis key: ${key}, amount: ${amount}`)
    const { errorMessage, status } = error
    throw new ServerError(Errors.BALANCE_UPDATE_FAILED({ errorMessage, code: status }))
  }
}

const insertBalanceActivity = async ({ balanceActivity }) => {
  try {
    let resBalanceActivity
    resBalanceActivity = await dbHelper.executeQuery(create(balanceActivityTable.TABLE_NAME, balanceActivity), balanceActivity)
    if (!resBalanceActivity.insertId) {
      logger.error("didn't insert balance_activity", balanceActivity)
      return
    }
  } catch (error) {
    logger.error(error)
  }
}

module.exports = { updateBalanceByTransaction }
