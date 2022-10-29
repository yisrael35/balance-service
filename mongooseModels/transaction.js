const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction
