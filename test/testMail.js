const fs = require('fs')
const handlebars = require("handlebars")
const mongoose = require('mongoose')
require('dotenv').config()

const { productsSearcher } = require('../lib/productsSearcher.js')
const { sendEmail } = require('../lib/sendEmail.js')
let rawdata = fs.readFileSync('../config/sites.json')
let sites = JSON.parse(rawdata)

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value")
}
const mail = process.argv[3]
if (!mail){
  throw("Provide argument with mail value")
}

productsSearcher(search, sites).then(async products => {
  fs.writeFileSync('result.json',JSON.stringify(products,null, 2))
  const file = fs.readFileSync('../templates/test.hbs')
  const template =  handlebars.compile(file.toString())
  const body = template({search:search,products:products})
  sendEmail(mail,'Resultados: '+search,body)
})
