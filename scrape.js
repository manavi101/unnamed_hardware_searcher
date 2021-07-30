const HttpError = require('./models/http-error')
const { productsSearcher } = require('./lib/productsSearcher.js')
const sites = require('./config/sites.json')

const search = async (req, res, next) => {
  const { searchText } = req.body;
    try {
      productsSearcher(searchText, sites).then(products => {
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
      })
    } catch (error) {
      return next(
        new HttpError('Ha ocurrido un error al buscar el producto.', 400)
      );
    }
}

module.exports = { 
  search
}