const fs = require('fs')
const handlebars = require("handlebars")
const mongoose = require('mongoose')
require('dotenv').config()

const { productsSearcher } = require('./productsSearcher.js')
const { sendEmail } = require('./sendEmail.js')
const NewsletterSearch = require('../models/newsletterSearch.js')
const Newsletter = require('../models/newsletter.js')
const Site = require('../models/site.js')

async function generateNewsletters(routine){
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
    const newsletters = await Newsletter.find({routine:routine})
    const sites = await Site.find()
    if(newsletters){
      const file = fs.readFileSync('./templates/test.hbs').toString()
      for await(const newsletter of newsletters){
        try{
          const newProducts = await productsSearcher(newsletter.value, sites)
          let products = Array()
          if (newProducts) {
            const oldProducts = await NewsletterSearch.findOne({ value: newsletter.value, routine: routine })
            await NewsletterSearch.updateOne(
              { value: newsletter.value, routine: routine }, 
              { value: newsletter.value, routine: routine, products: newProducts }, 
              { upsert: true }
            )
            products = compareProducts(newProducts, oldProducts)
          } else {
            products = null
          }
          handlebars.registerHelper('isNull', (value) => {
            return value !== null
          })
          const template = handlebars.compile(file)
          const body = template({ search: newsletter.value, products: products })
          await sendEmail(newsletter.emails, 'Resultados de: ' + newsletter.value, body)
            .then(v=>{
              console.log('Newsletter value: '+newsletter.value+' sent')
            })
        }catch(err){
          console.error("Newsletter value:"+newsletter.value+" has an error",err)
        }
      }
      await mongoose.disconnect()
    }
  }catch(err){
    mongoose.disconnect()
    throw new Error(err)
  }
}

function compareProducts(newProducts,oldProducts){
  const newStockProducts = newProducts.filter(v => v.stockAvailable)
  let products = Array()
  products.notStock = newProducts.filter(v => !v.stockAvailable)
  products.stock = Array()
  products.stock.higher = Array()
  products.stock.cheaper = Array()
  products.stock.equal = Array()
  products.new = Array()
  if(newStockProducts){
    if(oldProducts){
      newStockProducts.forEach((v)=>{
        const result = oldProducts.products.find(product => product.name===v.name)
        if(result){
          if(result.price>v.price){
            v.lastPrice = result.price
            v.percentage = ((result.price*100)/v.price)-100
            products.stock.higher.push(v)
          }else if(result.price===v.price){
            products.stock.equal.push(v)
          }else{
            v.lastPrice = result.price
            v.percentage = 100-((result.price*100)/v.price)
            products.stock.cheaper.push(v)
          }
        }else{
          products.new.push(v)
        }
      },oldProducts)
    }else{
      products.stock.equal = newStockProducts
    }
  }
  return products
}

module.exports = {
  generateNewsletters
};