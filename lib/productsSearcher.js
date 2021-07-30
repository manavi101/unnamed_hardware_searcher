const puppeteer = require('puppeteer')

//This function changes the number format. Some sites uses . to separe thousands and anothers uses . to separe decimals. 
function parseLocaleNumber(stringNumber, locale) {
  var thousandSeparator = Intl.NumberFormat(locale).format(11111).replace(/\p{Number}/gu, '');
  var decimalSeparator = Intl.NumberFormat(locale).format(1.1).replace(/\p{Number}/gu, '');

  return parseFloat(stringNumber.toString()
      .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
      .replace(new RegExp('\\' + decimalSeparator), '.')
  );
}
//Viewport solutions lazyimages from not loading without using a scrolling function
const DEFAULT_VIEWPORT = {
  width: 1000,
  height: 4000,
  deviceScaleFactor: 1,
};

async function  productsSearcher(search,sites) { 
  //launch puppeteer and creating an Incognito Browser
	const browser = await puppeteer.launch({headless:true,defaultViewport: DEFAULT_VIEWPORT})
  const context = await browser.createIncognitoBrowserContext();
  let products = []; 
  const promises = sites.map(async (v) =>{//i prefeer map because it makes all at once
    const page = await context.newPage()//Creating new tabs
    try{
      const site = v;
      await page.goto(site.url,{waitUntil:['domcontentloaded', 'networkidle2']})
      /*
        We contemplate two cases. 
        Typing is if the searchbar it's keysensitive,
        Input it's when you can exclude typing and force to change value on search bar and then click on the search bar button
      */
      switch (site.search.searchType){
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
        /*
          readKey it's a function to search recursivly on the element. 
          We use it for childnodes or a value that is at least in a second layer key.
        */
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
        //first obtains the elements of all products
        tmp.names = Array.from(document.querySelectorAll(site.productName));
        tmp.prices = Array.from(document.querySelectorAll(site.price));
        tmp.imgs = Array.from(document.querySelectorAll(site.img));
        tmp.productUrls = Array.from(document.querySelectorAll(site.productUrl));
        tmp.stockAvailable = Array.from(document.querySelectorAll(site.stockAvailable));
        //then returns everything mapping it and getting the values from it
        return tmp.names.map((v,i)=>{
          return {
            name:       readKey(v,keys.productName),
            price:      readKey(tmp.prices[i],keys.price),
            img:        readKey(tmp.imgs[i],keys.img),
            productUrl: readKey(tmp.productUrls[i],keys.productUrl),
            stockAvailable: (readKey(tmp.stockAvailable[i],keys.stockAvailable.key)===keys.stockAvailable.value)
          }
        })
      },site))
      //we substr the values if for some reason it has words or characters between the value that we want
      //it's only needed for price right now
      const substrs = site.substr;
      result.map((v)=>{
        v.price = v.price.substr(substrs.price.first,v.price.length-substrs.price.final-substrs.price.first)
        v.price = parseLocaleNumber(v.price,site.priceFormat)
        return v;
      })
      await page.close()//closing tab
      return result;
      }catch(err){
        console.log(err);
        await page.close()
        return null;//if there is an error in all of that, we'll return null. Sometimes a site might not work or might be slow
      } 
  },browser,search,products)

  await Promise.all(promises).then((v)=>{
    products = v.flat(1)
    browser.close()
    //Yeah i sort it here
    products.sort((a, b) =>   b.stockAvailable - a.stockAvailable || parseFloat(parseLocaleNumber(a.price,"en")) - parseFloat(parseLocaleNumber(b.price,"en")))
  })
  return products
}

module.exports = {
  productsSearcher
};