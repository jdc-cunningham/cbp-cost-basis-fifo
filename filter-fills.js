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

// transfers
const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
transferredArr.forEach(transfer => btcBuys.push({
  size: parseFloat(transfer.size),
  price: parseFloat(transfer.price)
}));

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
fills.forEach(fill => {
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
});

let gainUsd = 0;

const processSell = (sellSize, sellPrice) => {
  const firstBuy = btcBuys[0];

  if (sellSize <= firstBuy.size) {
    // decrease size of first row
    gainUsd += ((sellSize * sellPrice) * ((sellPrice / firstBuy.price) - 1));

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
          gainUsd += ((curBuy.size * sellPrice) * ((sellPrice / curBuy.price) - 1));
          removeIndexes.push(i);
        } else {
          gainUsd += ((sellSizeRemainder * sellPrice) * ((sellPrice / curBuy.price) - 1));
          sellSizeRemainder = 0;
          updateIndexes.push({
            index: i,
            size: sellSizeRemainder
          });
        }
      } else {
        sellSizeRemainder = sellSize - curBuy.size;
        gainUsd += ((curBuy.size * sellPrice) * ((sellPrice / curBuy.price) - 1));
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

  console.log(`cumulative sell gains $${gainUsd.toFixed(2)}`);
}

for (let i = 0; i < btcSells.length; i++) {
  const curSell = btcSells[i];
  processSell(curSell.size, curSell.price);
}

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