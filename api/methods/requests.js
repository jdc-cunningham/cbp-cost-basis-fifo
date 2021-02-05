require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

/**
 * 
 * @param {integer} requestedPortfolio for matching environment values
 * @param {integer} page for pagination 
 * @param {integer} cursorId this is used in the query not sent as a header to CBP
 */
const getFills = async (requestedPortfolio, page = null, cursorId = null) => {
  return new Promise(resolve => {
    const activePortfolio = requestedPortfolio;
    // before would be newer data if starting from older
    const pageParam = page ? `&after=${cursorId}&limit=100` : ''; // using 100 default pagination limit

    const portfolios = [
      {}, // offset
      {
        key: process.env.CBP_PORTFOLIO_1_KEY,
        passphrase: process.env.CBP_PORTFOLIO_1_PASSPHRASE,
        secret: process.env.CBP_PORTFOLIO_1_SECRET
      },
      {
        key: process.env.CBP_PORTFOLIO_2_KEY,
        passphrase: process.env.CBP_PORTFOLIO_2_PASSPHRASE,
        secret: process.env.CBP_PORTFOLIO_2_SECRET
      },
      {
        key: process.env.CBP_PORTFOLIO_3_KEY,
        passphrase: process.env.CBP_PORTFOLIO_3_PASSPHRASE,
        secret: process.env.CBP_PORTFOLIO_3_SECRET
      },
      {
        key: process.env.CBP_PORTFOLIO_4_KEY,
        passphrase: process.env.CBP_PORTFOLIO_4_PASSPHRASE,
        secret: process.env.CBP_PORTFOLIO_4_SECRET
      },
      {
        key: process.env.CBP_PORTFOLIO_5_KEY,
        passphrase: process.env.CBP_PORTFOLIO_5_PASSPHRASE,
        secret: process.env.CBP_PORTFOLIO_5_SECRET
      }
    ];
  
    const secret = portfolios[activePortfolio].secret;
  
    const timestamp = Date.now() / 1000;
    // CB-AFTER header eg. add below
    // https://docs.pro.coinbase.com/#success
    const requestPath = `/fills?product_id=BTC-USD${pageParam}`;
  
    const method = 'GET';
  
    // create the prehash string by concatenating required parts
    const what = timestamp + method + requestPath;
  
    // decode the base64 secret
    const key = new Buffer.from(secret, 'base64');
  
    // create a sha256 hmac with the secret
    const hmac = crypto.createHmac('sha256', key);
  
    // sign the require message with the hmac
    // and finally base64 encode the result
    const sign = hmac.update(what).digest('base64');
  
    axios.get(`${process.env.CBP_API_BASE}/fills?product_id=BTC-USD${pageParam}`, {
      headers: {
        'CB-ACCESS-KEY': portfolios[activePortfolio].key,
        'CB-ACCESS-SIGN': sign,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': portfolios[activePortfolio].passphrase
      }
    })
    .then((response) => {
      resolve({
        headers: response.headers,
        data: response.data
      });
    })
    .catch((error) => {
      resolve(false);
    });
  });
}

// this whole thing only designed for BTC at this time
const getPrice = () => {
 // get BTC price
 axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
 .then((response) => {
   resolve(response.data.bpi.USD.rate);
 })
 .catch((error) => {
   resolve(false);
 });
}

module.exports = {
  getFills
}