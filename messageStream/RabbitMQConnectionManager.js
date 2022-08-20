const fs = require('fs/promises')
const amqp = require('amqplib')
const path = require('path')

const logger = require('../utils/Logger')

const _rabbitConnections = {}
const _connectionsListeners = {}
const _connectionsFiles = path.join(__dirname, 'rabbitInstances')

const initialize = async () => {
  if (!(Object.keys(_rabbitConnections).length === 0)) {
    return
  }
  const files = await fs.readdir(_connectionsFiles)
  const promises = []
  files.forEach((filename) => promises.push(addNewConnection(filename)))
  await Promise.all(promises)
  logger.info(`RabbitConnectionManager: All rabbit connections(${Object.keys(_rabbitConnections).length}) are ready`)
}

const pushMessageToQueue = async (instanceName, queueName, message) => {
  if (!_rabbitConnections[instanceName]) {
    throw new Error(`Rabbit instance with name: ${instanceName} is missing`)
  }
  await _rabbitConnections[instanceName].assertQueue(queueName, { durable: true }, (error) => {
    logger.warn(`[QUEUE NAME: ${queueName}] MESSAGE: ${message}, error: ${error}`)
  })
  await _rabbitConnections[instanceName].sendToQueue(queueName, Buffer.from(message))
}

const listenToQueueMessages = async (instanceName, queueName, callback) => {
  if (!_rabbitConnections[instanceName]) {
    throw new Error(`Rabbit instance with name: ${instanceName} is missing`)
  }
  await _rabbitConnections[instanceName].assertQueue(queueName, { durable: true }, (error) => {
    logger.warn(`[QUEUE NAME: ${queueName}], error: ${error}`)
  })
  await _rabbitConnections[instanceName].consume(queueName, callback, { noAck: true })

  if (_connectionsListeners[instanceName]) {
    if (!_connectionsListeners[instanceName].some((instance) => instance.queue === queueName)) {
      _connectionsListeners[instanceName] = [
        ..._connectionsListeners[instanceName],
        {
          queue: queueName,
          listenerCallback: callback
        }
      ]
    }
  }
  logger.info(`Rabbit connection ${instanceName} start Listening to queue: ${queueName}`)
}

module.exports = {
  initialize,
  pushMessageToQueue,
  listenToQueueMessages
}

const addNewConnection = async (fileName) => {
  const fileJSONData = await fs.readFile(path.join(_connectionsFiles, fileName))
  const data = JSON.parse(fileJSONData)
  if (!data) {
    throw new Error(`rabbit instance json file data is not valid, file name: ${fileName}`)
  }
  const connectionUrl = `${data.RABBIT_MQ_PROTOCOL}://${data.RABBIT_MQ_USERNAME}:${data.RABBIT_MQ_PASSWORD}@${data.RABBIT_MQ_HOST}:${data.RABBIT_MQ_PORT}/${data.RABBIT_VIRTUAL_HOST}?heartbeat=60`
  const connection = await amqp.connect(connectionUrl)
  connection.on('error', (error) => {
    if (error.message !== 'Connection closing') {
      logger.error(`Message Broker Connection Error: ${error.message}, stack: ${error.stack}`)
    }
  })
  connection.on('close', async () => {
    logger.info('Message Broker Connection closed, trying to reconnect...')
    await addNewConnection(fileName)
  })
  connection.on('blocked', (reason) => {
    logger.error(`AMQP connection is blocked reason: ${reason}.`)
  })
  const channel = await connection.createChannel()
  _rabbitConnections[data.RABBIT_MQ_INSTANCE_NAME] = channel
  logger.info(`Connection to Rabbit instance: ${data.RABBIT_MQ_INSTANCE_NAME} created successfully`)

  if (_connectionsListeners[data.RABBIT_MQ_INSTANCE_NAME]) {
    for (const connectionListener of _connectionsListeners[data.RABBIT_MQ_INSTANCE_NAME]) {
      await listenToQueueMessages(data.RABBIT_MQ_INSTANCE_NAME, connectionListener.queue, connectionListener.listenerCallback)
    }
  } else {
    _connectionsListeners[data.RABBIT_MQ_INSTANCE_NAME] = []
  }
}
