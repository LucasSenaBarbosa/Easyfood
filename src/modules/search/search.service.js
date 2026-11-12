const prisma = require("../../database/prisma");
const { httpError } = require("../shared/http.utils");

const MAX_TERM_LENGTH = 100;
const MAX_RESULTS = 20;

function parseTerm(value) {
  if (value === undefined) {
    return "";
  }

  if (typeof value !== "string" || value.trim().length > MAX_TERM_LENGTH) {
    throw httpError(400, `A busca deve ter no máximo ${MAX_TERM_LENGTH} caracteres`);
  }

  return value.trim();
}

// Procura em restaurantes (nome e categoria) e pratos (nome, categoria e descrição)
async function search(rawTerm) {
  const term = parseTerm(rawTerm);

  if (!term) {
    return { restaurants: [], dishes: [] };
  }

  const matches = { contains: term, mode: "insensitive" };

  const [restaurants, dishes] = await Promise.all([
    prisma.restaurant.findMany({
      where: { OR: [{ name: matches }, { category: matches }] },
      orderBy: { name: "asc" },
      take: MAX_RESULTS
    }),
    prisma.dish.findMany({
      where: { OR: [{ name: matches }, { category: matches }, { description: matches }] },
      include: { restaurant: true },
      orderBy: { name: "asc" },
      take: MAX_RESULTS
    })
  ]);

  return { restaurants, dishes };
}

module.exports = { search };
