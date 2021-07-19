const HttpError = require('./models/http-error')
const { productsSearcher } = require('./productsSearcher.js')
const sites = require('./config/sites.json')

const search = async (req, res, next) => {
  const { searchText } = req.body;
    try {
      productsSearcher(searchText, sites).then(products => {
        res.status(200).json(products)
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