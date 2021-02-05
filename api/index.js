require('dotenv').config({ path: './.env' });
const express = require('express');
const app = express();
const port = 5009;
const { getBtcPrice } = require('./methods/requests');
const { getGainsLoss } = require('./methods/process');

// CORs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/btc-price', getBtcPrice);

app.get('/total-fifo-gains-loss', getGainsLoss);

app.get('*', (req, res) => {
  res.status(404).send('404: Bad Request');
});

app.listen(port, () => {
  console.log(`App running... on port ${port}`);
});