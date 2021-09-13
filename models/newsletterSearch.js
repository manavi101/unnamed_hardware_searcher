const mongoose = require('mongoose');
const {Schema} = mongoose;

const newsletterSearchSchema = new Schema({
    value: String,
    routine: String,
    products:[{
        name: String,
        price: Number,
        img: String,
        productUrl: String,
        stockAvailable: Boolean
    }]
})
module.exports = mongoose.model('newsletterSearch', newsletterSearchSchema);