// this is a test file just running through data
require('dotenv').config({ path: './.env' });
const fs = require('fs');
const fills = JSON.parse(fs.readFileSync('local.json'));

let boughtBtc = 0;
let soldBtc = 0;
let miscBtc = 0;
let btcBalance = 0;
const transferred = parseFloat(process.env.TRANSFERRED_BTC_AMT);

// tmp
const btcPriceNow = 31285;
let gainSellBtc = 0;

const btcBuys = [];
const btcSells = [];
const btcLeft = [];

// pagination limit 100
console.log(fills.length);

// this matches value in fills.js
const activePortfolio = 2;

// transfers
if (activePortfolio === 1) {
  const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
  transferredArr.forEach(transfer => btcBuys.push({
    size: parseFloat(transfer.size),
    price: parseFloat(transfer.price)
  }));
}

const gainCalc = (btcBuyPrice, btcSellPrice) => {
  return (btcSellPrice / btcBuyPrice) > 0;
}

const gainMultiplier = (buyPrice, sellPrice) => {
  return sellPrice / buyPrice;
};

// https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
fills.sort(function(a, b) {
  var x = a['created_at']; var y = b['created_at'];
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
});

// first loop to get data sorted
for (let i = 0; i < fills.length; i++) {
  const fill = fills[i];
  console.log('fill', fill.size);
  if (fill.side === 'buy') {
    boughtBtc += parseFloat(fill.size);
    btcBuys.push({
      size: parseFloat(fill.size),
      price: parseFloat(fill.price)
    });
    // btcLeft.push({
    //   size: fill.size,
    //   price: fill.price
    // });
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

let gainUsd = 0;

for (let i = 0; i < btcBuys.length; i++) {
  console.log('btc buy', btcBuys[i]);
}

const processSell = (sellSize, sellPrice) => {
  const firstBuy = btcBuys[0];

  if (sellSize <= firstBuy.size) {
    // decrease size of first row
    gainUsd += ((sellPrice * sellSize) - (firstBuy.price * firstBuy.size));

    if (sellSize === firstBuy.size) {
      btcBuys.shift(); // remove first buy row
    } else {
      btcBuys[0].size = btcBuys[0].size - sellSize; // reduce first row size
    }
  } else {
    // loop till filled
    const removeIndexes = [];
    const updateIndexes = [];
    let sellSizeRemainder = 0;

    for (let i = 0; i < btcBuys.length; i++) {
      const curBuy = btcBuys[i];

      if (sellSizeRemainder > 0) {
        if (sellSizeRemainder >= curBuy.size) {
          sellSizeRemainder = sellSizeRemainder - curBuy.size;
          gainUsd += ((sellPrice * curBuy.size) - (curBuy.price * curBuy.size));

          removeIndexes.push(i);
        } else {
          gainUsd += ((sellSizeRemainder * sellSize) - (sellSizeRemainder * curBuy.size));
          sellSizeRemainder = 0;
          updateIndexes.push({
            index: i,
            size: sellSizeRemainder
          });
        }
      } else {
        sellSizeRemainder = sellSize - curBuy.size;
        gainUsd += ((sellPrice * curBuy.size) - (curBuy.price * curBuy.size));

        removeIndexes.push(i);
      }

      if (sellSizeRemainder === 0) {
        break;
      }
    }
    
    // update buys array and remove used rows according to FIFO
    removeIndexes.forEach(removeIndex => btcBuys.splice(removeIndex, 1));
    updateIndexes.forEach(updateIndex => btcBuys[updateIndex.index].size = btcBuys[updateIndex.index].size - updateIndex.size);
  }
}

for (let i = 0; i < btcSells.length; i++) {
  const curSell = btcSells[i];
  console.log('sell', curSell.price);
  processSell(curSell.size, curSell.price);
}

let hodlBtc = 0;

// console.log(btcBuys);

// left over from sells
// btcBuys.forEach(btcBuy => {
//   if (parseFloat(btcBuy.price) > 33000) {
//     hodlBtc += parseFloat(btcBuy.size);
//   }
// });

// console.log('hodl btc', hodlBtc);

console.log('gains', gainUsd);

// console.log('bought btc', boughtBtc);
// console.log('sold btc', soldBtc);
// console.log('misc btc', miscBtc);
// console.log('transfered', parseFloat(transferred.toFixed(8)));
// console.log('btc balance', parseFloat((boughtBtc - soldBtc + transferred).toFixed(8)));
// console.log('btc to sell now', gainSellBtc);
// console.log('money to make now', gainSellBtc * btcPriceNow);
// console.log('btc buys', btcBuys);
// console.log('btc left', btcLeft);