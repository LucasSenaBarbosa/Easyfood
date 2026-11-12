const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  // Campos internos que nunca saem da API (em nenhum módulo)
  omit: {
    restaurant: { normalizedName: true }
  }
});

module.exports = prisma;
