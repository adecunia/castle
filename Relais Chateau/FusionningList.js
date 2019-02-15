//Required libraries
const scrape = require('./RelaisChateau.js');
const michelinScrape = require('./RestaurantMichelin.js');
let fs = require('fs');

'use strict';

const hotel_RelaisChateaux = scrape.getHotelsJSON();
const Restaurant_Michelin = michelinScrape.getRestaurantsJSON();

fs.writeFileSync("RelaisEtoiles.json", JSON.stringify(findStarsRestaurants(hotel_RelaisChateaux, Restaurant_Michelin)));

function findStarsRestaurants(RelaisChateauHotel, RestaurantMichelin) {
  let HotelsEtoiles = [];
  for (let i = 0; i < RelaisChateauHotel.length; i++) {
    for (let j = 0; j < RestaurantMichelin.length; j++) {
      if (RelaisChateauHotel[i].chef === RestaurantMichelin[j].chef && RelaisChateauHotel[i].postalCode === RestaurantMichelin[j].postalCode) {
        HotelsEtoiles.push({
          "hotelName": RelaisChateauHotel[i].name,
          "restaurantName": RestaurantMichelin[j].name,
          "postalCode": RelaisChateauHotel[i].postalCode,
          "chef": RelaisChateauHotel[i].chef,
          "url": RelaisChateauHotel[i].url,
          "price": RelaisChateauHotel[i].price
        })
      }
    }
  }
  return HotelsEtoiles;
}

console.log("Fichier écrit.");