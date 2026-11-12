const cartService = require("./cart.service");
const { handleError } = require("../shared/http.utils");

async function get(req, res) {
  try {
    return res.json(await cartService.getCart(req.user.id));
  } catch (error) {
    return handleError(res, error);
  }
}

async function addItem(req, res) {
  try {
    const cart = await cartService.addItem(req.user.id, req.body || {});
    return res.status(201).json(cart);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateItem(req, res) {
  try {
    return res.json(await cartService.updateItem(req.user.id, req.params.itemId, req.body || {}));
  } catch (error) {
    return handleError(res, error);
  }
}

async function removeItem(req, res) {
  try {
    return res.json(await cartService.removeItem(req.user.id, req.params.itemId));
  } catch (error) {
    return handleError(res, error);
  }
}

async function clear(req, res) {
  try {
    await cartService.clearCart(req.user.id);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { get, addItem, updateItem, removeItem, clear };
