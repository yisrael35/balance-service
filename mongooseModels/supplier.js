const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Supplier = mongoose.model('Supplier', supplierSchema)
module.exports = Supplier
