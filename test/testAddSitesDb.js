const mongoose = require('mongoose');
require('../models/sites.js');
const Sites = mongoose.model('sites');
const fs = require('fs')
require('dotenv').config()

let rawdata = fs.readFileSync('sites.json')
let documents = JSON.parse(rawdata);

(async()=>{
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    const insertmany = await Sites.insertMany(documents)
    console.log(insertmany)
    await mongoose.disconnect()
  }catch(err){
    console.log(err)
  }
})()

