const schedule = require('node-schedule');
const { generateNewsletters } = require('../src/generateNewsletters.js')

const daily = schedule.scheduleJob('0 15 * * *', function(){
  console.log('GenerateNewsletter daily launched');
  generateNewsletters('daily').catch(err=>console.error(err))
});

const weekly = schedule.scheduleJob('0 10 * * 0', function(){
  console.log('GenerateNewsletter weekly launched');
  generateNewsletters('weekly').catch(err=>console.error(err))
});

const monthly = schedule.scheduleJob('10 10 1 * *', function(){
  console.log('GenerateNewsletter monthly launched');
  generateNewsletters('monthly').catch(err=>console.error(err))
});