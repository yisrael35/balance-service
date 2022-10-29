const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Client = mongoose.model('Client', clientSchema)
module.exports = Client
