const mongoose = require('mongoose')

const currencySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

// currencySchema.methods.findCurrency = function (currencyId, callback) {
//   this.db.model('Currency').find({ id: currencyId })
// }

// currencySchema.statics.findCurrency = function (currencyId, callback) {
//   return this.find({ id: currencyId }, callback)
// }

const Currency = mongoose.model('Currency', currencySchema)
module.exports = Currency
