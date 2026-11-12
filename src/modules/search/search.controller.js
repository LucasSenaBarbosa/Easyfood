const searchService = require("./search.service");
const { handleError } = require("../shared/http.utils");

async function search(req, res) {
  try {
    return res.json(await searchService.search(req.query.q));
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { search };
