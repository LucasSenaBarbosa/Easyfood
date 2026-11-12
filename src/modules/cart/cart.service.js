const { Prisma } = require("@prisma/client");
const prisma = require("../../database/prisma");
const { httpError, parseId } = require("../shared/http.utils");

const MAX_QUANTITY = 99;
const ITEM_INCLUDE = { dish: { include: { restaurant: { select: { id: true, name: true } } } } };

function parseQuantity(value) {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw httpError(400, `A quantidade deve ser um número inteiro de 1 a ${MAX_QUANTITY}`);
  }

  return quantity;
}

// Valores em Decimal para não acumular erro de arredondamento em dinheiro
function toCart(items) {
  const subtotal = items.reduce(
    (total, item) => total.plus(item.dish.price.times(item.quantity)),
    new Prisma.Decimal(0)
  );

  return {
    restaurant: items.length > 0 ? items[0].dish.restaurant : null,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
    items: items.map(({ id, quantity, dish }) => ({
      id,
      quantity,
      lineTotal: dish.price.times(quantity).toFixed(2),
      dish: {
        id: dish.id,
        name: dish.name,
        category: dish.category,
        price: dish.price,
        imageUrl: dish.imageUrl,
        restaurantId: dish.restaurantId
      }
    }))
  };
}

async function getCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: ITEM_INCLUDE,
    orderBy: { id: "asc" }
  });

  return toCart(items);
}

async function addItem(userId, { dishId, quantity = 1 }) {
  const id = parseId(dishId);
  const amount = parseQuantity(quantity);
  const dish = await prisma.dish.findUnique({ where: { id } });

  if (!dish) {
    throw httpError(404, "Prato não encontrado");
  }

  const items = await prisma.cartItem.findMany({ where: { userId }, include: { dish: true } });

  // Um pedido sai de um único restaurante
  if (items.some((item) => item.dish.restaurantId !== dish.restaurantId)) {
    throw httpError(409, "Seu carrinho já tem itens de outro restaurante. Esvazie-o para adicionar este prato");
  }

  const current = items.find((item) => item.dishId === id);
  parseQuantity((current ? current.quantity : 0) + amount);

  await prisma.cartItem.upsert({
    where: { userId_dishId: { userId, dishId: id } },
    create: { userId, dishId: id, quantity: amount },
    update: { quantity: { increment: amount } }
  });

  return getCart(userId);
}

// O item sempre é buscado junto com o dono, então ninguém altera o carrinho de outro usuário
async function findOwnItem(userId, itemId) {
  const id = parseId(itemId);
  const item = await prisma.cartItem.findFirst({ where: { id, userId } });

  if (!item) {
    throw httpError(404, "Item não encontrado no carrinho");
  }

  return item;
}

async function updateItem(userId, itemId, { quantity }) {
  const amount = parseQuantity(quantity);
  const item = await findOwnItem(userId, itemId);

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: amount } });

  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const item = await findOwnItem(userId, itemId);

  await prisma.cartItem.delete({ where: { id: item.id } });

  return getCart(userId);
}

async function clearCart(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
