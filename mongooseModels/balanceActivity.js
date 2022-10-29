const mongoose = require('mongoose')

const balanceActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (value !== 'owner' && value !== 'client' && value !== 'supplier') {
          throw new Error(`value is invalid, should be: (owner/client/supplier)`)
        }
      },
    },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: false },
    currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: false },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    oldAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    newAmount: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const BalanceActivity = mongoose.model('BalanceActivity', balanceActivitySchema)
module.exports = BalanceActivity
