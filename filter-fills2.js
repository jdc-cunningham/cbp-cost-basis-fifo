// this is a test file just running through data
require('dotenv').config({ path: './.env' });
const fs = require('fs');
const fills = JSON.parse(fs.readFileSync('local.json'));
const transferred = parseFloat(process.env.TRANSFERRED_BTC_AMT);

// this matches value in fills.js for the trasnferred btc
const activePortfolio = 2;

const btcBuys = [];
const btcSells = [];
let boughtBtc = 0;
let soldBtc = 0;
let miscBtc = 0;

// transfers
if (activePortfolio === 1) {
  const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
  transferredArr.forEach(transfer => {
    console.log('t', transfer.size, transfer.price, parseFloat(transfer.size) * parseFloat(transfer.price));
    btcBuys.push({
    size: parseFloat(transfer.size),
    price: parseFloat(transfer.price)});
  });
}

console.log(fills.length);

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

let usdGains = 0;

const processSell = (sellSize, sellPrice) => {
  console.log('sell', sellSize, sellPrice);
  if (sellSize <= btcBuys[0].size) {
    const firstBtcBuy = btcBuys[0];
    const buyPrice = firstBtcBuy.price;
    const sellCost = sellPrice * sellSize;
    usdGains += (sellCost - (sellSize * buyPrice));

    if (firstBtcBuy.size <= sellSize) {
      btcBuys.shift();
    } else {
      firstBtcBuy.size = firstBtcBuy.size - sellSize;
    }
  } else { // selling 5 from 3, 4
    console.log('process else', btcBuys[0].size);
    let filledSize = 0;

    /**
     * the sellSize is larger than several buy rows
     * so we have to iterate over multiple rows while keeping track
     * of how much of the row is used, until the sellSize is filled
     * if the entire row is used, you drop it eg. shift
     * if the row is partially used, update the size
     */

    while (filledSize < sellSize) {
      const curFillSize = sellSize - filledSize;
      const curBuyRow = btcBuys[0]; // 3, +3 to soldAmnt
      const buyPrice = curBuyRow.price;
      let sellCost = 0;

      if (curBuyRow.size <= curFillSize) {
        sellCost = sellPrice * curBuyRow.size;
        usdGains += (sellCost - (curBuyRow.size * buyPrice));
        filledSize += curBuyRow.size;
        btcBuys.shift();
      } else {
        sellCost = sellPrice * curFillSize;
        usdGains += (sellCost - (curFillSize * buyPrice));
        filledSize += curFillSize;
        curBuyRow.size = curBuyRow.size - curFillSize;
      }
    }
  }
};

for (let i = 0; i < btcSells.length; i++) {
  const btcSell = btcSells[i];
  processSell(btcSell.size, btcSell.price);

  // if (i === 2) {
  //   break;
  // }
}

console.log('gains', usdGains);
console.log('buys left', btcBuys);

let btcBuysLeft = 0;

btcBuys.forEach(btcBuy => btcBuysLeft += btcBuy.size);

console.log('btc buys left', btcBuysLeft);