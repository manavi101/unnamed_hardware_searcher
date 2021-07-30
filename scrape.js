const HttpError = require('./models/http-error')
const { productsSearcher } = require('./lib/productsSearcher.js')
const sites = require('./config/sites.json')

const getSitesConfig = async (req, res, next) => {
  try {
    res.status(200).json(sites)
  } catch (error) {
    return next(
      new HttpError('Ha ocurrido un error al obtener la configuración de sitios.', 400)
    );
  }
}

const search = async (req, res, next) => {
  const { searchText, config } = req.body;
    try {
      productsSearcher(searchText, config ? config : sites).then(products => {
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
  search,
  getSitesConfig
}