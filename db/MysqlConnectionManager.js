const mysql = require('mysql2')

// initialize
const pool = mysql
  .createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    connectionLimit: process.env.MYSQL_CONNECTIONS_LIMIT
  })
  .promise()

module.exports = pool
