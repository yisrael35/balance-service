const mongoose = require('mongoose')

const balanceSchema = new mongoose.Schema(
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
    currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: false },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Balance = mongoose.model('Balance', balanceSchema)
module.exports = Balance
