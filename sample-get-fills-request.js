require('dotenv').config({ path: './.env' })
const crypto = require('crypto');
const axios = require('axios');

const secret = process.env.CBP_DEFAULT_PORTFOLIO_SECRET;

const timestamp = Date.now() / 1000;
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
    'CB-ACCESS-KEY': process.env.CBP_DEFAULT_PORTFOLIO_KEY,
    'CB-ACCESS-SIGN': sign,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-ACCESS-PASSPHRASE': process.env.CBP_DEFAULT_PORTFOLIO_PASSPHRASE
  }
})
  .then(function (response) {
    // handle success
    console.log(response);
    console.log(response.data);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    console.log('err');
  });