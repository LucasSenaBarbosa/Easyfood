const express = require("express");
const controller = require("./cart.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.get);
router.post("/items", controller.addItem);
router.patch("/items/:itemId", controller.updateItem);
router.delete("/items/:itemId", controller.removeItem);
router.delete("/", controller.clear);

module.exports = router;
