const mongoose = require('mongoose');
const {Schema} = mongoose;

const searchSchema = new Schema({
    createdAt:{ type: Date, default: Date.now() },
    value: String,
    products:[{
        name: String,
        price: Number,
        img: String,
        productUrl: String,
        stockAvailable: Boolean
    }]
})
searchSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 86400 })
module.exports = mongoose.model('Search', searchSchema);