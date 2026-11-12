const favoriteService = require("./favorite.service");
const { handleError } = require("../shared/http.utils");

async function list(req, res) {
  try {
    return res.json(await favoriteService.listFavorites(req.user.id));
  } catch (error) {
    return handleError(res, error);
  }
}

async function add(req, res) {
  try {
    const restaurant = await favoriteService.addFavorite(req.user.id, req.params.restaurantId);
    return res.status(201).json(restaurant);
  } catch (error) {
    return handleError(res, error);
  }
}

async function remove(req, res) {
  try {
    await favoriteService.removeFavorite(req.user.id, req.params.restaurantId);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { list, add, remove };
