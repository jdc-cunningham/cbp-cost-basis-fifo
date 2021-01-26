require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

const getFills = (req, res) => {
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
      res.status(200).send(response.data);
    })
    .catch(function (error) {
      res.status(400).send('error');
    });
}

module.exports = {
  getFills
}