const puppeteer = require('puppeteer')
const fs = require('fs')
const { exit } = require('process')

let rawdata = fs.readFileSync('config/sites.json')
let sites = JSON.parse(rawdata)

const search = process.argv[2]
if (!search){
  throw("Provide argument with search value");
}

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
      await page.goto(site.url,{waitUntil:'domcontentloaded'})
      switch (site.searchType){
        case "typing":
          await page.waitForSelector(site.searchBar)
          await page.waitForSelector(site.searchBarButton)
          await page.type(site.searchBar, search, {delay: 20})
          await page.click(site.searchBarButton, {delay: 20})
        break;
        case "input":
          await page.evaluate ((site,search) => {
            const searchBar = document.querySelector(site.searchBar)
            const searchBarButton = document.querySelector(site.searchBarButton)
            searchBar.value = search;
            searchBarButton.click()
          },site,search)
      }
      await page.waitForNavigation({waitUntil:'networkidle2'})
      //await page.waitForTimeout(2000)
      //console.log(1)
      products = products.concat((await page.evaluate ((site) => {
        const tmp = {};
        const keys = site.key;
        const substrs = site.substr;
        tmp.names = Array.from(document.querySelectorAll(site.name));
        tmp.prices = Array.from(document.querySelectorAll(site.price));
        tmp.imgs = Array.from(document.querySelectorAll(site.img));
        tmp.productUrls = Array.from(document.querySelectorAll(site.productUrl));
        tmp.stockAvailable = Array.from(document.querySelectorAll(site.stockAvailable));
        return tmp.names.map((v,i)=>{
          return {
            name: v[keys.name],
            price: tmp.prices[i][keys.price].substr(substrs.price),
            img: tmp.imgs[i][keys.img],
            productUrl: tmp.productUrls[i][keys.productUrl],
            stockAvailable: (tmp.stockAvailable[i][keys.stockAvailable.key]===keys.stockAvailable.value),
          }
        })
      },site)).map((v)=>{
        v.price = parseLocaleNumber(v.price,site.priceFormat)
        return v;
      }))
      page.close()
      //console.log(2)
      }catch(err){
        console.log(err);
        browser.close()
        exit(1)
      } 
  },browser,search,products)
  Promise.all(promises).then(()=>{
    browser.close()
    products.sort((a, b) =>   b.stockAvailable - a.stockAvailable || parseFloat(parseLocaleNumber(a.price,"en")) - parseFloat(parseLocaleNumber(b.price,"en")))
    fs.writeFileSync('result.json',JSON.stringify(products,null, 2))
  })
}
productsSearcher(search,sites)

module.exports = {productsSearcher};