const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const redis_group = require('../redis/redisGroup')
const logger = require('../utils/Logger')
const dbHelper = require('../db/dbHelper')
const { balance } = require('../constants/DatabaseTables').DatabaseTables
const { updateBalanceClient, updateBalanceSupplier, updateBalanceUser, create, getLastBalance } = require('../sql/queries/balance')
const REDIS_GROUP_BALANCE = process.env.REDIS_GROUP_BALANCE

const saveRedisBalanceToMySQL = async () => {
  try {
    const records = await redis_group.getAllGroupKeyValues(REDIS_GROUP_BALANCE)
    for await (const record of records) {
      const redis_key = Object.keys(record)[0]
      const amount = JSON.parse(Object.values(record)[0])
      const balanceInfo = redis_key.split(':')
      const type = balanceInfo[0]
      const id = balanceInfo[1]
      const currencyId = balanceInfo[2]

      let userId, supplierId, clientId
      if (type === 'owner') {
        userId = id
      } else if (type === 'client') {
        clientId = id
      } else if (type === 'supplier') {
        supplierId = id
      }
      const filterBy = { currencyId, userId, supplierId, clientId, type }
      const [resBalance] = await dbHelper.executeQuery(getLastBalance({ filterBy }))

      // update new balance in db
      if (!resBalance) {
        //create new balance
        const balanceData = { amount, currency_id: currencyId, user_id: userId, supplier_id: supplierId, client_id: clientId, type }
        await dbHelper.executeQuery(create(balance.TABLE_NAME, balanceData), balanceData)
        logger.info(`Create type:${type}, id: ${id}, amount: ${amount} successfully`)
      } else {
        //update balance
        const balanceData = { amount }
        if (type === 'owner') {
          await dbHelper.executeQuery(updateBalanceUser(balanceData, id, currencyId), balanceData)
        } else if (type === 'client') {
          await dbHelper.executeQuery(updateBalanceClient(balanceData, id, currencyId), balanceData)
        } else if (type === 'supplier') {
          await dbHelper.executeQuery(updateBalanceSupplier(balanceData, id, currencyId), balanceData)
        }
        logger.info(`Update type:${type}, id: ${id}, amount: ${amount} successfully`)
      }
    }
    process.exit(0)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

saveRedisBalanceToMySQL()
