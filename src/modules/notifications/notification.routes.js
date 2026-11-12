const express = require("express");
const controller = require("./notification.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.list);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:notificationId/read", controller.markAsRead);

module.exports = router;
