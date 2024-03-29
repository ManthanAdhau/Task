const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductTransactionSchema = new Schema({
  id: {
    type: String,
    required: [true, 'every product should have unique id'],
    trim: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'product must have title'],
    trim: true
  },
  price: {
    type: String,
    required: [true, 'product must have a price'],
    trim: true
  },
    description: {
    type: String,
    required: [true, 'product must have a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'product must have a name'],
    trim: true
  },
    image: {
    type: String,
    required: [true, 'product must have an image'],
    trim: true
  },
    sold: {
    type: Boolean,
    required: [true, 'product must have sold status'],
    trim: true
  },
    dateOfSale: {
    type: Date,
    required: [true, 'product must have dateOfSale'],
    trim: true
  }
})



const ProductTransactions = mongoose.model('ProductTransaction', ProductTransactionSchema)

module.exports = ProductTransactions