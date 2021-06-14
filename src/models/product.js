let mongoose = require('mongoose')
let validator = require('validator')
// https://www.npmjs.com/package/validator

let productSchema = new mongoose.Schema({
  name: {
        type: String,
        required: true,
        unique: true
  },
  price: { type: Number, min: 0, required: [true, 'A rating is needed for this movie']},
  brand: String,
});

module.exports = mongoose.model('Product', productSchema);