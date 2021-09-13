const mongoose = require('mongoose');
const {Schema} = mongoose;

const newsletterSchema = new Schema({
    value: String,
    routine: String,
    emails:[String]
})
module.exports = mongoose.model('newsletter', newsletterSchema);