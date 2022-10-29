require('dotenv').config()
const { messageType } = require('./helpers/messageType')
const errorHandler = require('./utils/ErrorHandler')
const RabbitConnectionManager = require('./messageStream/RabbitMQConnectionManager')
const logger = require('./utils/Logger')
const MAIN_BALANCE_QUEUE = process.env.R_MQ_NAME_MAIN_BALANCE_QUEUE
const R_MQ_INSTANCE_NAME = process.env.R_MQ_INSTANCE_NAME
require('./db/mongoose')

const launchServer = async () => {
  try {
    logger.info('[Server] Starting to run balance service')
    await RabbitConnectionManager.initialize()
    await RabbitConnectionManager.listenToQueueMessages(R_MQ_INSTANCE_NAME, MAIN_BALANCE_QUEUE, messageType)
    logger.info('[Server] balance service is running successfully')
  } catch (error) {
    errorHandler(error)
  }
}

launchServer()
