const notificationService = require("./notification.service");
const { handleError } = require("../shared/http.utils");

async function list(req, res) {
  try {
    return res.json(await notificationService.listNotifications(req.user.id));
  } catch (error) {
    return handleError(res, error);
  }
}

async function markAsRead(req, res) {
  try {
    return res.json(await notificationService.markAsRead(req.user.id, req.params.notificationId));
  } catch (error) {
    return handleError(res, error);
  }
}

async function markAllAsRead(req, res) {
  try {
    return res.json(await notificationService.markAllAsRead(req.user.id));
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { list, markAsRead, markAllAsRead };
