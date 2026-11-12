const restaurantService = require("./restaurant.service");
const { handleError } = require("../shared/http.utils");

async function list(req, res) {
  try {
    const restaurantes = await restaurantService.listRestaurants();
    return res.json(restaurantes);
  } catch (error) {
    return handleError(res, error);
  }
}

async function create(req, res) {
  try {
    const { name, category, rating } = req.body;
    const restaurant = await restaurantService.createRestaurant({ name, category, rating }, req.user);
    return res.status(201).json(restaurant);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { list, create };
