// this is a test file just running through data
require('dotenv').config({ path: './.env' });

const processBuySells = (activePortfolio, apiData) => {
  const { fills, btcPrice } = apiData;
  const btcBuys = [];
  const btcSells = [];

  // transfers, this is a special case
  // if (parseInt(activePortfolio) === 1) {
  //   const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
  //   transferredArr.forEach(transfer => {
  //     btcBuys.push({
  //     size: parseFloat(transfer.size),
  //     price: parseFloat(transfer.price)});
  //   });
  // }

  // sort values by ascending date
  // https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
  fills.sort(function(a, b) {
    var x = a['created_at']; var y = b['created_at'];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });

  // first loop to get data sorted
  for (let i = 0; i < fills.length; i++) {
    const fill = fills[i];

    // date check
    const dateFillsOffset = '2021-09-18T12:43:51.672Z';
    if (dateFillsOffset && fill.created_at < dateFillsOffset) {
      continue;
    }

    if (fill.side === 'buy') {
      btcBuys.push({
        size: parseFloat(fill.size),
        price: parseFloat(fill.price)
      });
    } else if (fill.side === 'sell') {
      btcSells.push({
        size: parseFloat(fill.size),
        price: parseFloat(fill.price),
        dateTime: fill.created_at
      });
    } else {
      miscBtc += parseFloat(fill.size);
    }
  };

  let usdGains = 0;
  const sellGainLoss = [];

  const processSell = (sellSize, sellPrice, sellDateTime) => {
    const prevUsdGains = usdGains;
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

    sellGainLoss.push({
      size: sellSize,
      price: sellPrice,
      usdGain: (usdGains - prevUsdGains),
      sellDateTime
    });
  };

  for (let i = 0; i < btcSells.length; i++) {
    const btcSell = btcSells[i];
    processSell(btcSell.size, btcSell.price, btcSell.dateTime);
  }

  return {
    buys: btcBuys,
    sells: btcSells,
    sellGainLoss,
    gains: usdGains,
    overPaginationLimit: fills.length < 100 ? false : true,
    btcPrice
  }
}

module.exports = {
  processBuySells
}