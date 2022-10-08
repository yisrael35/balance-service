const RabbitConnectionManager = require('../messageStream/RabbitMQConnectionManager')
const ServerError = require('../utils/ServerError')
const { Errors } = require('../constants/Errors')
const { QueueMessageType } = require('../constants/QueueMessageType')
const { updateBalanceByTransaction } = require('../models/updateTransactionBalance')
const { getBalance } = require('../models/getBalance')
const { getBalanceActivity } = require('../models/getBalanceActivity')
const errorHandler = require('../utils/ErrorHandler')
const BALANCE_MAIN_QUEUE = process.env.R_MQ_NAME_BALANCE_MAIN_QUEUE
const R_MQ_INSTANCE_NAME = process.env.R_MQ_INSTANCE_NAME

const messageType = async (incomingMessage) => {
  let parsedMessage
  try {
    try {
      parsedMessage = JSON.parse(incomingMessage.content.toString())
    } catch (error) {
      throw new ServerError(Errors.MESSAGE_JSON_PARSE_FAILED(incomingMessage.content.toString()))
    }
    if (!parsedMessage.data || !parsedMessage.id) {
      const errorMessage = 'Missing fields, required fields: (id, data)'
      throw new ServerError(Errors.QUEUE_MESSAGE_ERROR({ errorMessage, code: 400 }))
    }
    let response
    switch (parsedMessage.type) {
      case QueueMessageType.updateBalanceByTransaction:
        response = await updateBalanceByTransaction(parsedMessage)
        break
      case QueueMessageType.getBalance:
        response = await getBalance(parsedMessage)
        break
      case QueueMessageType.getBalanceActivity:
        response = await getBalanceActivity(parsedMessage)
        break
      default:
        throw new ServerError(Errors.QUEUE_MESSAGE_TYPE_ERROR(incomingMessage.type))
    }

    const responseMessage = { type: parsedMessage.type, code: 200, data: response, request_id: parsedMessage.id, error: false }
    await RabbitConnectionManager.pushMessageToQueue(R_MQ_INSTANCE_NAME, BALANCE_MAIN_QUEUE, JSON.stringify(responseMessage))
  } catch (error) {
    const { code, message } = error
    if (code) {
      const errorMessage = { type: parsedMessage?.type || 'messageType', code, data: { message }, request_id: parsedMessage?.id, error: true }
      await RabbitConnectionManager.pushMessageToQueue(R_MQ_INSTANCE_NAME, BALANCE_MAIN_QUEUE, JSON.stringify(errorMessage))
    }
    errorHandler(error)
  }
}

module.exports = { messageType }
