const redis_group = require('./redisGroup')
const logger = require('../utils/Logger')
const dbHelper = require('../db/dbHelper')
const { getLastBalance } = require('../sql/queries/balance')
const REDIS_GROUP_BALANCE = process.env.REDIS_GROUP_BALANCE

/**
 * When the server start this method takes all current balance that stored in redis and clean it.
 * and load the last balance from MySQL DB to Redis
 */
const initBalanceRedisData = async () => {
  try {
    if (!REDIS_GROUP_BALANCE) {
      throw 'env file not configured correctly for redis balance table'
    }
    // await getBalanceDataFromRedis()

    // get balance data FROM MYSQL-DB
    let resBalances = await dbHelper.executeQuery(getLastBalance({ filterBy: {} }))

    //load balance data to redis
    for (const balance of resBalances) {
      const { currency_id: currencyId, user_id: userId, supplier_id: supplierId, client_id: clientId, type, amount } = balance
      const key = `${type}:${userId || supplierId || clientId}:${currencyId}`
      logger.info(`Trying to insert balance, key: ${key}, amount: ${amount} to Redis`)
      try {
        await redis_group.insertToGroup(REDIS_GROUP_BALANCE, key, amount)
      } catch (error) {
        logger.error(`Error: ${error}, Failed to insert to Redis data: ${balance}`)
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

module.exports = {
  initBalanceRedisData,
}

const cleanAllBalanceInRedis = async () => {
  // clean all Redis Balance
  const balance_keys = await redis_group.getAllGroupKeys(REDIS_GROUP_BALANCE)
  for (const val of balance_keys) {
    try {
      const to_remove = val.split(':')[0] + ':'
      const key = val.replace(to_remove, '')
      await redis_group.deleteFromGroup(REDIS_GROUP_BALANCE, key)
    } catch (error) {
      logger.error(error)
    }
  }
}

const getBalanceDataFromRedis = async () => {
  const records = await redis_group.getAllGroupKeyValues(REDIS_GROUP_BALANCE)
  for await (const record of records) {
    const redis_key = Object.keys(record)[0]
    const redis_data = JSON.parse(Object.values(record)[0])
    logger.info({ redis_key, redis_data })
  }
}
