const mysql = require('../db/MysqlConnectionManager')
const { Errors } = require('../constants/Errors')
const ServerError = require('../utils/ServerError')

const getConnection = async (host) => {
  const connection = await mysql.getConnection()
  return connection
}
const releaseConnection = async (connection) => {
  await connection.release()
}

// execute query on database
const executeQuery = async (sqlQuery, data = {}) => {
  let response
  try {
    response = await mysql.query(sqlQuery, Object.values(data))
  } catch (error) {
    console.log({ error })
    throw new ServerError(Errors.MYSQL_SERVER_ERROR({ errorMessage: error.message, sqlMessage: error.sqlMessage }))
  }
  return response[0]
}

const executeQueryByConnection = async (sqlQuery, data = {}, connection) => {
  let response
  try {
    response = await connection.query(sqlQuery, Object.values(data))
  } catch (error) {
    console.log({ error })
    throw new ServerError(Errors.MYSQL_SERVER_ERROR({ errorMessage: error.message, sqlMessage: error.sqlMessage }))
  }
  return response[0]
}

module.exports = {
  getConnection,
  releaseConnection,
  executeQuery,
  executeQueryByConnection
}
