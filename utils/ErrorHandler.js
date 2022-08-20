const logger = require('./Logger')

const errorHandler = (error) => {
  const { code, message, systemMessage, stack } = error

  if (code) {
    logger.warn(`[${code}] message: ${message}, stack: ${stack}`)
  } else {
    logger.error(`UNEXPECTED ERROR message: ${message}, systemMessage: ${systemMessage}, stack: ${stack}`)
  }
}

module.exports = errorHandler
