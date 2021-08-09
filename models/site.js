const mongoose = require('mongoose');
const {Schema} = mongoose;

const siteSchema = new Schema({
    url:String,
    name:String,
    search:{
      searchType:String,
      searchBar:String,
      searchBarButton:String,
      redirect:Boolean
    },
    productName: String,
    price: String,
    img: String,
    productUrl:String,
    stockAvailable:String,
    key:{
      productName:String,
      price:String,
      img:String,
      productUrl:String,
      stockAvailable:{
        key:String,
        value:Schema.Types.Mixed
      }
    },
    substr:{
      price:{
        first:Number,
        final:Number
      }
    },
    popup:String,
    priceFormat:String
})

module.exports = mongoose.model('Site', siteSchema);