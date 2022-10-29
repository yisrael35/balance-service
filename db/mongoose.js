const mongoose = require('mongoose')
const logger = require('../utils/Logger')

const mongoUrl = `mongodb://${process.env.MONGO_DB_HOST}/${process.env.MONGO_DB_NAME}`

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    logger.info(`[Mongo] init MongoDB connection successfully`)
  })
  .catch((error) => {
    logger.error(`[Mongo] init MongoDB connection failed, error: ${error}`)
  })
