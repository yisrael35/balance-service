const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const redis_group = require('../redis/redisGroup')
const logger = require('../utils/Logger')
const dbHelper = require('../db/dbHelper')
const { updateBalanceClient, updateBalanceSupplier, updateBalanceUser } = require('../sql/queries/balance')
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
    process.exit(0)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

saveRedisBalanceToMySQL()
