//Required libraries for scraping
let Promise = require('promise');
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

//List of promises to create
let List_Promises = [];
let List_PromisesIndiv = [];

let restaurantsList = [];
let Index_scraping = 1;
console.log("Writing Json file with Michelin Restaurants.");
//Creating promises
function createPromises() {
  for (let i = 1; i <= 37; i++) {
    let url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i.toString();
    List_Promises.push(fillRestaurantsList(url));
    //console.log("Page " + i + " of starred Michelin restaurants added to the list");
  }
}

function createIndividuaList_Promises() {
  return new Promise(function(resolve) {
    if (Index_scraping === 1) {
      for (let i = 0; i < restaurantsList.length / 2; i++) {
        let restaurantURL = restaurantsList[i].url;
        List_PromisesIndiv.push(fillRestaurantInfo(restaurantURL, i));
        //console.log("Added url of " + i + "th restaurant to the promises list");
      }
      resolve();
      Index_scraping++;
    }
    if (Index_scraping === 2) {
      for (let i = restaurantsList.length / 2; i < restaurantsList.length; i++) {
        let restaurantURL = restaurantsList[i].url;
        List_PromisesIndiv.push(fillRestaurantInfo(restaurantURL, i));
        //console.log("Added url of " + i + "th restaurant to the promises list");
      }
      resolve();
    }
  })
}

//Fetching list of all restaurants
function fillRestaurantsList(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(err, res, html) {
      if (err) {
        console.error(err);
        return reject(err);
      } else if (res.statusCode !== 200) {
        err = new Error("Unexpected status code : " + res.statusCode);
        err.res = res;
        console.error(err);
        return reject(err);
      }
      let $ = cheerio.load(html);
      $('.poi-card-link').each(function() {
        let data = $(this);
        let link = data.attr("href");
        let url = "https://restaurant.michelin.fr/" + link;
        restaurantsList.push({
          "name": "",
          "postalCode": "",
          "chef": "",
          "url": url
        })
      });
      resolve(restaurantsList);
    });
  });
}

//Getting all detailed info for the JSON file
function fillRestaurantInfo(url, index) {
  return new Promise(function(resolve, reject) {
    request(url, function(err, res, html) {
      if (err) {
        console.error(err);
        return reject(err);
      } else if (res.statusCode !== 200) {
        err = new Error("Unexpected status code : " + res.statusCode);
        err.res = res;
        console.error(err);
        return reject(err);
      }

      const $ = cheerio.load(html);
      $('.poi_intro-display-title').first().each(function() {
        let data = $(this);
        let name = data.text();
        name = name.replace(/\n/g, "");
        restaurantsList[index].name = name.trim();
      });

      $('.postal-code').first().each(function() {
        let data = $(this);
        let pc = data.text();
        restaurantsList[index].postalCode = pc;
      });

      $('#node_poi-menu-wrapper > div.node_poi-chef > div.node_poi_description > div.field.field--name-field-chef.field--type-text.field--label-above > div.field__items > div').first().each(function() {
        let data = $(this);
        let chefname = data.text();
        restaurantsList[index].chef = chefname;
      });
      //console.log("Added info of " + index + "th restaurant");
      resolve(restaurantsList);
    });
  });
}

//Saving the file as RestaurantsEtoiles.json
function saveRestaurantsInJson() {
  return new Promise(function(resolve) {
    try {
      
      let jsonRestaurants = JSON.stringify(restaurantsList);
      fs.writeFile("RestaurantsEtoiles.json", jsonRestaurants, function doneWriting(err) {
        if (err) {
          console.error(err);
        }
      });
    } catch (error) {
      console.error(error);
    }
    resolve();
  });
}

//Main()
createPromises();
Promise.all(List_Promises)
  .then(createIndividuaList_Promises)
  .then(() => {
    return Promise.all(List_PromisesIndiv);
  })
  .then(createIndividuaList_Promises)
  .then(() => {
    return Promise.all(List_PromisesIndiv);
  })
  .then(saveRestaurantsInJson)
  .then(() => {
    console.log("Successfuly saved restaurants JSON file")
  });

module.exports.getRestaurantsJSON = function() {
  return JSON.parse(fs.readFileSync("RestaurantsEtoiles.json"));
};