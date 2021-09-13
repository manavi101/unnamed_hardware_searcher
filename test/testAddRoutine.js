const mongoose = require('mongoose');
const Newsletter = require('../models/newsletter.js');
require('dotenv').config()

const search = process.argv[2]
const routine = process.argv[3]
let emails = process.argv[4]
if (!emails){
  throw("Provide argument with email value");
}
if (!routine){
  throw("Provide argument with routine value");
}
if (!search){
  throw("Provide argument with search value");
}
emails=emails.split(";");
(async()=>{
  try{
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
    await Newsletter.updateOne({value:search,routine:routine},{value:search,routine:routine,emails:emails},{upsert:true,setDefaultsOnInsert:true})
    await mongoose.disconnect()
  }catch(err){
    console.log(err)
  }
})()



