require('dotenv').config()
const { messageType } = require('./helpers/messageType')
const errorHandler = require('./utils/ErrorHandler')
const { initBalanceRedisData } = require('./redis/initRedisData')
const RabbitConnectionManager = require('./messageStream/RabbitMQConnectionManager')
const logger = require('./utils/Logger')
const MAIN_BALANCE_QUEUE = process.env.R_MQ_NAME_MAIN_BALANCE_QUEUE
const R_MQ_INSTANCE_NAME = process.env.R_MQ_INSTANCE_NAME

const launchServer = async () => {
  try {
    logger.info('[Server] Starting to run balance service')
    await initBalanceRedisData()
    logger.info('[Redis] data load successfully ')
    await RabbitConnectionManager.initialize()
    await RabbitConnectionManager.listenToQueueMessages(R_MQ_INSTANCE_NAME, MAIN_BALANCE_QUEUE, messageType)
    logger.info('[Server] balance service is running successfully')
  } catch (error) {
    errorHandler(error)
  }
}

launchServer()
