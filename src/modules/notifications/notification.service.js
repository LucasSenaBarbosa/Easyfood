const prisma = require("../../database/prisma");
const { httpError, parseId } = require("../shared/http.utils");

const MAX_LISTED = 50;

// Notificar é uma ação secundária: uma falha aqui nunca derruba a operação principal
async function notifyUsers(userIds, { type, title, message }) {
  if (userIds.length === 0) {
    return;
  }

  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, title, message }))
    });
  } catch (error) {
    console.error("Erro ao criar notificação:", error.message);
  }
}

// Avisa quem favoritou o restaurante, exceto quem causou o evento
async function notifyRestaurantFollowers(restaurantId, excludedUserId, content) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { restaurantId, userId: { not: excludedUserId } },
      select: { userId: true }
    });

    await notifyUsers(favorites.map((favorite) => favorite.userId), content);
  } catch (error) {
    console.error("Erro ao notificar seguidores:", error.message);
  }
}

async function listNotifications(userId) {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: MAX_LISTED
    }),
    prisma.notification.count({ where: { userId, readAt: null } })
  ]);

  return { items, unreadCount };
}

async function markAsRead(userId, notificationId) {
  const id = parseId(notificationId);
  const notification = await prisma.notification.findFirst({ where: { id, userId } });

  if (!notification) {
    throw httpError(404, "Notificação não encontrada");
  }

  if (!notification.readAt) {
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  return listNotifications(userId);
}

async function markAllAsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() }
  });

  return listNotifications(userId);
}

module.exports = {
  notifyUsers,
  notifyRestaurantFollowers,
  listNotifications,
  markAsRead,
  markAllAsRead
};
