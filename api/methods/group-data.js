const { getFills } = require('./requests');

// mostly this is here for the recursive aspect
/**
 * 
 * @param {array} allFills
 * @param {integer} page 
 * @param {integer} cursorId from CBP response headers
 */
const getNextFills = async (allFills, portfolioId, page, cursorId) => {
  setTimeout(async () => {
    page += 1;
    // info on pagination https://docs.pro.coinbase.com/#pagination
    const nextFills = await getFills(portfolioId, page, cursorId);
    allFills = allFills.concat(nextFills.data);
    paginated = nextFills.data.length === 100;
    if (paginated) {
      getNextFills(allFills, portfolioId, page, nextFills.headers['cb-after'], res);
    } else {
      return allFills;
    }
  }, 500); // this delay is to prevent hammering the CBP API though it's 3 requests per second
}

const getData = async (req, res) => {
  const portfolioId = parseInt(req.params['portfolio_id']);
  // const endpoint = req.params['endpoint']; // this is here but only fills is honored

  // what
  if (!Number.isInteger(portfolioId) || portfolioId < 0 || portfolioId > 5) {
    res.status(400).send('400: Bad Request');
  }

  const fillsRes = await getFills(portfolioId);

  if (fillsRes.data && fillsRes.data.length) {
    // deal with potentially recursive pagination
    const fills = fillsRes.data;
    let paginated = fills.length === 100;
    let allFills = fills;
    let page = 0;

    // this calls a recursive function to get all data
    if (paginated) {
      getNextFills(allFills, portfolioId, page, fillsRes.headers['cb-after'], res);
    } else {
      return allFills;
    }
  } else {
    return false;
  }
};

module.exports = {
  getData
}