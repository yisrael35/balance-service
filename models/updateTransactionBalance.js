const ServerError = require('../utils/ServerError')
const { processUpdateTransactionBalance } = require('../helpers/processManager')
const dbHelper = require('../db/dbHelper')
const { Errors } = require('../constants/Errors')
const { lockBalance, getLastBalance, unlockTables, create, updateBalanceClient, updateBalanceSupplier, updateBalanceUser } = require('../sql/queries/balance')
const logger = require('../utils/Logger')
const { balanceActivity: balanceActivityTable, balance } = require('../constants/DatabaseTables').DatabaseTables

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
  const connection = await dbHelper.getConnection()
  try {
    // lock table
    await dbHelper.executeQueryByConnection(lockBalance(), {}, connection)
    // get last balance and calculate a new one
    const filterBy = { currencyId, userId, supplierId, clientId, type }
    const [resBalance] = await dbHelper.executeQueryByConnection(getLastBalance({ filterBy }), {}, connection)
    let oldAmount = resBalance ? Number(resBalance.amount) : 0

    const newAmount = Number(oldAmount + amount)
    // update new balance in db
    if (!resBalance) {
      //create new balance
      const balanceData = { amount: newAmount, currency_id: currencyId, user_id: userId, supplier_id: supplierId, client_id: clientId, type }
      await dbHelper.executeQueryByConnection(create(balance.TABLE_NAME, balanceData), balanceData, connection)
    } else {
      //update balance
      const balanceData = { amount: newAmount }
      if (type === 'owner') {
        await dbHelper.executeQueryByConnection(updateBalanceUser(balanceData, userId, currencyId), balanceData, connection)
      } else if (type === 'client') {
        await dbHelper.executeQueryByConnection(updateBalanceClient(balanceData, clientId, currencyId), balanceData, connection)
      } else if (type === 'supplier') {
        await dbHelper.executeQueryByConnection(updateBalanceSupplier(balanceData, supplierId, currencyId), balanceData, connection)
      }
    }

    await dbHelper.executeQueryByConnection(unlockTables(), {}, connection)
    await dbHelper.releaseConnection(connection)
    return {
      oldAmount,
      newAmount,
    }
  } catch (error) {
    logger.log(error)
    const { sqlMessage, errorMessage, status } = error
    await dbHelper.executeQueryByConnection(unlockTables(), {}, connection)
    await dbHelper.releaseConnection(connection)
    throw new ServerError(Errors.BALANCE_UPDATE_FAILED({ errorMessage, systemMessage: sqlMessage, code: status }))
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
