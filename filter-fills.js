// this is a test file just running through data
const fs = require('fs');
const fills = JSON.parse(fs.readFileSync('local.json'));

let boughtBtc = 0;
let soldBtc = 0;
let miscBtc = 0;
let btcBalance = 0;
const transferred = 0;

// pagination limit 100

fills.forEach(fill => {
  if (fill.side === 'buy') {
    boughtBtc += parseFloat(fill.size);
  } else if (fill.side === 'sell') {
    soldBtc += parseFloat(fill.size);
  } else {
    console.log('else fired');
    miscBtc += parseFloat(fill.size);
  }
});

console.log('bought btc', boughtBtc);
console.log('sold btc', soldBtc);
console.log('misc btc', miscBtc);
console.log('transfered', parseFloat(transferred.toFixed(8)));
console.log('btc balance', parseFloat((boughtBtc - soldBtc + transferred).toFixed(8)));