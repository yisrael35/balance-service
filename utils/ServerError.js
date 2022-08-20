class ServerError extends Error {
  constructor ({ code, message, systemMessage }) {
    super(message)
    this.code = code
    this.systemMessage = systemMessage
  }
}

module.exports = ServerError
