const redis = require('redis')

let _client

const _createConnection = async () => {
  _client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  })
  await _client.connect()
}

/**
 * Return redis client connected to the db.+
 * @return {Promise<redis.RedisClientType>} client instance in a promise.
 */
const getInstance = async () => {
  if (!_client || !_client.isOpen) {
    await _createConnection()
  }
  return _client
}

module.exports = {
  getInstance,
}
