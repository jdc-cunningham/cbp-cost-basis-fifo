require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

const getFills = async (requestedPortfolio) => {
  return new Promise(resolve => {
    const activePortfolio = requestedPortfolio;

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
      }
    ];
  
    const secret = portfolios[activePortfolio].secret;
  
    const timestamp = Date.now() / 1000;
    // pagination by &after=2
    // CB-AFTER header eg. add below
    // https://docs.pro.coinbase.com/#success
    const requestPath = '/fills?product_id=BTC-USD';
  
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
  
    axios.get(`${process.env.CBP_API_BASE}/fills?product_id=BTC-USD`, {
      headers: {
        'CB-ACCESS-KEY': portfolios[activePortfolio].key,
        'CB-ACCESS-SIGN': sign,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': portfolios[activePortfolio].passphrase
      }
    })
    .then(function (response) {
      resolve(response.data);
    })
    .catch(function (error) {
      resolve(false);
    });
  });
}

module.exports = {
  getFills
}