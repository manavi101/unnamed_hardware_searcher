const mongoose = require('mongoose');
const Site = require('../models/site.js');
const Search = require('../models/search.js');
const { productsSearcher } = require('../src/productsSearcher.js')
require('dotenv').config()

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value");
}

(async()=>{
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
    const sites = await Site.find()
    let result = await Search.findOne({value:search})
    console.log(result)
    if(!result){
      const products = await productsSearcher(search, sites)
      await Search.updateOne({value:search},{value:search,products:products},{upsert:true,setDefaultsOnInsert:true})
      console.log(products)
    }else{
      console.log(result.products)
    }
    await mongoose.disconnect()
  }catch(err){
    console.log(err)
  }
})()



