const puppeteer = require('puppeteer')
const fs = require('fs')
const { exit } = require('process');

function parseLocaleNumber(stringNumber, locale) {
  var thousandSeparator = Intl.NumberFormat(locale).format(11111).replace(/\p{Number}/gu, '');
  var decimalSeparator = Intl.NumberFormat(locale).format(1.1).replace(/\p{Number}/gu, '');

  return parseFloat(stringNumber.toString()
      .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
      .replace(new RegExp('\\' + decimalSeparator), '.')
  );
}
const DEFAULT_VIEWPORT = {
  width: 1000,
  height: 4000,
  deviceScaleFactor: 1,
};

async function  productsSearcher(search,sites) { 
	const browser = await puppeteer.launch({headless:false,defaultViewport: DEFAULT_VIEWPORT})
  const context = await browser.createIncognitoBrowserContext();
  let products = [];
  const promises = sites.map(async (v) =>{
    try{
      const site = v;
      const page = await context.newPage()
      await page.goto(site.url,{waitUntil:['domcontentloaded', 'networkidle2']})
      switch (site.search.type){
        case "typing":
          await page.waitForSelector(site.search.searchBar)
          await page.waitForSelector(site.search.searchBarButton)
          await page.type(site.search.searchBar, search, {delay: 20})
          await page.click(site.search.searchBarButton, {delay: 20})
        break;
        case "input":
          await page.evaluate ((site,search) => {
            const searchBar = document.querySelector(site.search.searchBar)
            const searchBarButton = document.querySelector(site.search.searchBarButton)
            searchBar.value = search;
            searchBarButton.click()
          },site,search)
      }
      if(site.search.redirect){
        await page.waitForNavigation({waitUntil:'networkidle0'})
      }else{
        await page.waitForTimeout(2000)
      }
      const result = (await page.evaluate ((site) => {
        function readKey(element,key,i=0){
          if(!Array.isArray(key))
            key = key.split(">")
          if(element[key[i]]){
            element = element[key[i]]
            i++
            if(key[i]){
              element = readKey(element,key,i)
            }else{
              return element
            }
          }else{
            return null
          }
          return element
        }
        const tmp = {};
        const keys = site.key;
        tmp.names = Array.from(document.querySelectorAll(site.name));
        tmp.prices = Array.from(document.querySelectorAll(site.price));
        tmp.imgs = Array.from(document.querySelectorAll(site.img));
        tmp.productUrls = Array.from(document.querySelectorAll(site.productUrl));
        tmp.stockAvailable = Array.from(document.querySelectorAll(site.stockAvailable));
        return tmp.names.map((v,i)=>{
          return {
            name:       readKey(v,keys.name),
            price:      readKey(tmp.prices[i],keys.price),
            img:        readKey(tmp.imgs[i],keys.img),
            productUrl: readKey(tmp.productUrls[i],keys.productUrl),
            stockAvailable: (readKey(tmp.stockAvailable[i],keys.stockAvailable.key)===keys.stockAvailable.value)
          }
        })
      },site))
      const substrs = site.substr;
      result.map((v)=>{
        v.price = v.price.substr(substrs.price.first,v.price.length-substrs.price.final-substrs.price.first)
        v.price = parseLocaleNumber(v.price,site.priceFormat)
        return v;
      })
      products = products.concat(result)
      await page.close()
      }catch(err){
        console.log(err);
        await browser.close()
        exit(1)
      } 
  },browser,search,products)
  await Promise.all(promises).then(()=>{
    browser.close()
    products.sort((a, b) =>   b.stockAvailable - a.stockAvailable || parseFloat(parseLocaleNumber(a.price,"en")) - parseFloat(parseLocaleNumber(b.price,"en")))
  })
  return products
}

module.exports = {
  productsSearcher
};