const mongoose = require('mongoose');
const Site = require('../models/site.js');
const fs = require('fs')
require('dotenv').config()

let rawdata = fs.readFileSync('sites.json')
let documents = JSON.parse(rawdata);

(async()=>{
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    const insertmany = await Site.insertMany(documents)
    console.log(insertmany)
    await mongoose.disconnect()
  }catch(err){
    console.log(err)
  }
})()

