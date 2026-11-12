const express = require("express");
const controller = require("./favorite.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.list);
router.post("/:restaurantId", controller.add);
router.delete("/:restaurantId", controller.remove);

module.exports = router;
