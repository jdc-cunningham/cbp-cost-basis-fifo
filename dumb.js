// this is a test file just running through data
require('dotenv').config({ path: './.env' });
const fs = require('fs');
const fills = JSON.parse(fs.readFileSync('local.json'));
const transferred = parseFloat(process.env.TRANSFERRED_BTC_AMT);

// this matches value in fills.js for the trasnferred btc
const activePortfolio = 1;

const btcBuys = [];
const btcSells = [];
let boughtBtc = 0;
let soldBtc = 0;
let miscBtc = 0;

// transfers
if (activePortfolio === 1) {
  const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
  transferredArr.forEach(transfer => btcBuys.push({
    size: parseFloat(transfer.size),
    price: parseFloat(transfer.price)
  }));
}

// sort values by ascending date
// https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
fills.sort(function(a, b) {
  var x = a['created_at']; var y = b['created_at'];
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
});

// first loop to get data sorted
for (let i = 0; i < fills.length; i++) {
  const fill = fills[i];
  if (fill.side === 'buy') {
    boughtBtc += parseFloat(fill.size);
    btcBuys.push({
      size: parseFloat(fill.size),
      price: parseFloat(fill.price)
    });
  } else if (fill.side === 'sell') {
    soldBtc += parseFloat(fill.size);
    btcSells.push({
      size: parseFloat(fill.size),
      price: parseFloat(fill.price)
    });
  } else {
    miscBtc += parseFloat(fill.size);
  }
};

let btcBought = 0;
const buyCosts = [];
const buyPrices = [];

btcBuys.forEach(btcBuy => {
  btcBought += btcBuy.size;
  buyCosts.push(btcBuy.size * btcBuy.price);
  buyPrices.push(btcBuy.price);
});

let btcSold = 0;
const sellCosts = [];
const sellPrices = [];

btcSells.forEach(btcSell => {
  btcSold += btcSell.size;
  sellCosts.push(btcSell.size * btcSell.price);
  sellPrices.push(btcSell.price);
});

// averaging
// https://stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers
const btcCostBasis = (
  buyCosts.reduce((a, b) => a + b, 0) /
  btcBought
);

console.log('cost basis', btcCostBasis);

const sellCostBasis = (
  sellCosts.reduce((a, b) => a + b, 0) /
  btcSold
);

console.log('sell basis', sellCostBasis);

// what....