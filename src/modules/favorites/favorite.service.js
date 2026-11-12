const prisma = require("../../database/prisma");
const notificationService = require("../notifications/notification.service");
const { httpError, parseId } = require("../shared/http.utils");

async function listFavorites(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { restaurant: true },
    orderBy: { id: "desc" }
  });

  return favorites.map((favorite) => favorite.restaurant);
}

// Idempotente: favoritar de novo não duplica nem notifica outra vez
async function addFavorite(userId, restaurantId) {
  const id = parseId(restaurantId);
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });

  if (!restaurant) {
    throw httpError(404, "Restaurante não encontrado");
  }

  try {
    await prisma.favorite.create({ data: { userId, restaurantId: id } });
  } catch (error) {
    if (error.code === "P2002") {
      return restaurant;
    }
    throw error;
  }

  if (restaurant.ownerId !== userId) {
    await notificationService.notifyUsers([restaurant.ownerId], {
      type: "RESTAURANT_FAVORITED",
      title: "Novo favorito",
      message: `Alguém adicionou ${restaurant.name} aos favoritos.`
    });
  }

  return restaurant;
}

async function removeFavorite(userId, restaurantId) {
  const id = parseId(restaurantId);
  await prisma.favorite.deleteMany({ where: { userId, restaurantId: id } });
}

module.exports = { listFavorites, addFavorite, removeFavorite };
