const Errors = {
  MYSQL_SERVER_ERROR: (message, sqlMessage) => ({ code: 500, message: 'Internal Error', systemMessage: `mysql server error has been made: ${message}, ${sqlMessage}` }),
  MYSQL_DATA_INVALID_ERROR: (data) => ({ code: 412, message: 'Error has been made', systemMessage: `mysql data is invalid with response: ${JSON.stringify(data)}` }),
  QUEUE_MESSAGE_TYPE_ERROR: (type) => ({ code: 400, message: 'Incorrect message type', systemMessage: `Incoming message in queue has wrong type ${type}` }),
  QUEUE_MESSAGE_ERROR: ({ errorMessage, code, systemMessage }) => ({ code: code || 400, message: errorMessage, systemMessage: systemMessage || errorMessage }),
  PROCESS_ERROR: ({ errorMessage, code, systemMessage }) => ({ code: code || 400, message: errorMessage, systemMessage: systemMessage || errorMessage }),
  MESSAGE_JSON_PARSE_FAILED: (message) => ({
    code: 400,
    message: 'Failed to parsed JSON message from message broker',
    level2_message: `Failed to parsed JSON message from message broker: '${message}'`
  }),
  BALANCE_UPDATE_FAILED: ({ errorMessage, code, systemMessage }) => ({ code: code || 400, message: 'Internal Error - Failed to update balance', systemMessage: systemMessage || errorMessage })
}

module.exports = {
  Errors
}
