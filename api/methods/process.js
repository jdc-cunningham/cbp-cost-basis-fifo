// this is a test file just running through data
require('dotenv').config({ path: './.env' });
const { getFills, _getBtcPrice } = require('./requests');

const processBuySells = (activePortfolio, apiData) => {
  const { fills, btcPrice } = apiData;
  const btcBuys = [];
  const btcSells = [];

  // transfers, this is a special case
  if (parseInt(activePortfolio) === 1) {
    const transferredArr = JSON.parse(process.env.TRANSFERRED_BTC_ARR);
    transferredArr.forEach(transfer => {
      btcBuys.push({
      size: parseFloat(transfer.size),
      price: parseFloat(transfer.price)});
    });
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
    btcPrice
  }
}

const getGainsLoss = async (req, res) => {
  let allFills = [];
  const p1Fills = await getFills(1);
  const p2Fills = await getFills(2);
  const p3Fills = await getFills(3);
  const p4Fills = await getFills(4);
  const p5Fills = await getFills(5);
  const btcPrice = await _getBtcPrice();

  // ehh this sucks burnt currently as I write this
  allFills = p1Fills ? allFills.concat(p1Fills.data) : allFills;
  allFills = p2Fills ? allFills.concat(p2Fills.data) : allFills;
  allFills = p3Fills ? allFills.concat(p3Fills.data) : allFills;
  allFills = p4Fills ? allFills.concat(p4Fills.data) : allFills;
  allFills = p5Fills ? allFills.concat(p5Fills.data) : allFills;

  // this is all ugly, should just do an int loop
  const p1Gains = processBuySells(
    1,
    {
      fills: p1Fills.data,
      btcPrice
    }
  );

  const p2Gains = processBuySells(
    2,
    {
      fills: p2Fills.data,
      btcPrice
    }
  );

  const p3Gains = processBuySells(
    3,
    {
      fills: p3Fills.data,
      btcPrice
    }
  );

  const p4Gains = processBuySells(
    4,
    {
      fills: p4Fills.data,
      btcPrice
    }
  );

  const totalGains = processBuySells(
    1, // included
    {
      fills: allFills,
      btcPrice
    }
  );

  res.status(200).send(`
    total gains: $${totalGains.gains.toFixed(2)} <br>
    portfolio 1: $${p1Gains.gains.toFixed(2)} <br>
    portfolio 2: $${p2Gains.gains.toFixed(2)} <br>
    portfolio 3: $${p3Gains.gains.toFixed(2)} <br>
    portfolio 4: $${p4Gains.gains.toFixed(2)}
  `);
}

module.exports = {
  processBuySells,
  getGainsLoss
}