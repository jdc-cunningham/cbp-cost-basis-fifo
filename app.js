require('dotenv').config({ path: './.env' });
const express = require('express');
const app = express();
const port = 5000;

// referenced https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application
// for ejs
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('./pages/index');
});

app.listen(port, () => {
  console.log(`App running... on port ${port}`);
});