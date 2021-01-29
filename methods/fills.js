require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

const getFills = (req, res) => {
  const activePortfolio = 1; // 1, 2, 3 for my case different portfolios see array below.

  const portfolios = [
    {}, // offset
    {
      key: process.env.CBP_DEFAULT_PORTFOLIO_KEY,
      passphrase: process.env.CBP_DEFAULT_PORTFOLIO_PASSPHRASE,
      secret: process.env.CBP_DEFAULT_PORTFOLIO_SECRET
    },
    {
      key: process.env.CBP_SHORTS_PORTFOLIO_KEY,
      passphrase: process.env.CBP_SHORTS_PORTFOLIO_PASSPHRASE,
      secret: process.env.CBP_SHORTS_PORTFOLIO_SECRET
    },
    {
      key: process.env.CBP_FIFO_PORTFOLIO_KEY,
      passphrase: process.env.CBP_FIFO_PORTFOLIO_PASSPHRASE,
      secret: process.env.CBP_FIFO_PORTFOLIO_SECRET
    }
  ];

  const secret = portfolios[activePortfolio].secret;

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
      'CB-ACCESS-KEY': portfolios[activePortfolio].key,
      'CB-ACCESS-SIGN': sign,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': portfolios[activePortfolio].passphrase
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