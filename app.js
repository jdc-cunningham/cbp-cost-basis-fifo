require('dotenv').config({ path: './.env' });
const express = require('express');
const app = express();
const port = 5009;
const { getFills } = require('./methods/fills');
const { processBuySells } = require('./methods/process');

// referenced https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application
// for ejs
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('./pages/index');
});

app.get('/portfolio-*', (req, res) => {
  const activePortfolio = req.path.split('-')[1]; // not guaranteed to be right format
  if (!Number.isInteger(parseInt(activePortfolio))) {
    res.send('Invalid portfolio number');
  }

  getFills(activePortfolio).then((data) => {
    if (data) {
      res.render('./pages/portfolio', {
        portfolios: {
        'portfolio 1': 1,
        'portfolio 2': 2,
        'portfolio 3': 3
        },
        portfolioData: processBuySells(activePortfolio, data)
      });
    } else {
      res.send('Failed to get data from CBP');
    }
  });
});

app.get('*', (req, res) => {
  res.send('Invalid route');
});

app.listen(port, () => {
  console.log(`App running... on port ${port}`);
});