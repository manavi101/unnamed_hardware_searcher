const fs = require('fs')
const handlebars = require("handlebars");
require('dotenv').config()

const { productsSearcher } = require('./productsSearcher.js')
const { sendEmail } = require('./sendEmail.js')

let rawdata = fs.readFileSync('config/sites.json')
let sites = JSON.parse(rawdata)

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value");
}

productsSearcher(search, sites).then(async products => {
  fs.writeFileSync('result.json',JSON.stringify(products,null, 2))
  const file = fs.readFileSync('test.hbs')
  const template =  handlebars.compile(file.toString())
  const body = template({search:search,products:products})
  sendEmail('mativilla101@outlook.com.ar','Resultados: '+search,body)
})
