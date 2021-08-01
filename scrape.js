const HttpError = require('./models/http-error')
const mongoose = require('mongoose');
require('./models/sites.js');
require('./models/search.js');
const Sites = mongoose.model('sites');
const Search = mongoose.model('search');
const { productsSearcher } = require('./lib/productsSearcher.js')

const getSites = async (req, res, next) => {
  try {
    const sites = await Sites.find()
    res.status(200).json(sites.map(v=>v.name))
  } catch (error) {
    return next(
      new HttpError('Internal error getting sites values', 500)
    );
  }
}

const search = async (req, res, next) => {
  const searchText = req.query.value;// Search value
  const sites = req.query.sites; // Sites to search
  if(!searchText||searchText.length<3){
    return next(new HttpError('Invalid Search value', 400))
  }
  try {
    const sitesData = await Sites.find(sites?{value:{$in:sites}}:{})
    let queryResult = await Search.findOne({value:searchText})
    let products = []
    if(queryResult){//If it's in cache gets the result
      products = queryResult.products
    }else{//else execute puppeteer and updates cache
      products = await productsSearcher(searchText, sitesData)
      await Search.updateOne(
        {value:searchText},
        {value:searchText,products:products},
        {upsert:true,setDefaultsOnInsert:true}
      )
    }
    let result = {}
    result.data = products
    result.recordsTotal = products.length
    result.recordsWithStock = 0
    products.forEach((e,i) => {
      if(i === 0)
        result.minPrice = e.price
      if(e.stockAvailable)
        ++result.recordsWithStock
    })
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return next(
      new HttpError('Internal error searching product', 500)
    );
  }
}

module.exports = { 
  search,
  getSites
}