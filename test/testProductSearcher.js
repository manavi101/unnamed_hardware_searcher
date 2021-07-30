const fs = require('fs')
const { productsSearcher } = require('../lib/productsSearcher.js')

let rawdata = fs.readFileSync('sites.json')
let sites = JSON.parse(rawdata)

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value");
}

productsSearcher(search, sites).then(products => {
  fs.writeFileSync('result.json',JSON.stringify(products,null, 2))
})
