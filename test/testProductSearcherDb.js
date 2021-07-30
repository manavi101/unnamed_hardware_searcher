const mongoose = require('mongoose');
require('../models/sites.js');
require('../models/search.js');
const Sites = mongoose.model('sites');
const Search = mongoose.model('search');
const { productsSearcher } = require('../lib/productsSearcher.js')
require('dotenv').config()

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value");
}

(async()=>{
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
    const sites = await Sites.find()
    let result = await Search.findOne({value:search})
    console.log(result)
    if(!result){
      const products = await productsSearcher(search, sites)
      await Search.updateOne({value:search},{value:search,products:products},{upsert:true,setDefaultsOnInsert:true})
      await mongoose.disconnect()
      console.log(products)
    }else{
      await mongoose.disconnect()
      console.log(result.products)
    }
  }catch(err){
    console.log(err)
  }
})()



