const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
const activityService = require("../shared/activity.service");
const notificationService = require("../notifications/notification.service");
const { httpError } = require("../shared/http.utils");

// Para quem o comercial recebe os avisos (no futuro, virá do .env ou do banco)
const COMERCIAL_EMAIL = "felipe.oliveira@pro.fecaf.com.br";

const DUPLICATE_NAME_MESSAGE = "Já existe um restaurante cadastrado com este nome";

// Remove espaços nas pontas e espaços repetidos no meio
function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

// Chave usada na regra de unicidade: "  Pizza   do Zé " e "pizza do zé" são o mesmo nome
// (a migration add_restaurant_unique_name aplica a mesma regra nos registros antigos)
function normalizeName(name) {
  return cleanName(name).toLowerCase();
}

function validateRestaurant(data) {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw httpError(400, "Nome é obrigatório");
  }
  if (typeof data.category !== "string" || !data.category.trim()) {
    throw httpError(400, "Categoria é obrigatória");
  }

  const name = cleanName(data.name);

  if (name.length > 150) {
    throw httpError(400, "Nome deve ter no máximo 150 caracteres");
  }

  return {
    name,
    normalizedName: normalizeName(name),
    category: data.category.trim(),
    rating: data.rating || 0
  };
}

async function listRestaurants() {
  return prisma.restaurant.findMany();
}

async function createRestaurant(data, user) {
  const validated = validateRestaurant(data);

  // Checagem prévia para responder com uma mensagem clara
  const existing = await prisma.restaurant.findUnique({
    where: { normalizedName: validated.normalizedName }
  });

  if (existing) {
    throw httpError(409, DUPLICATE_NAME_MESSAGE);
  }

  // 1) O que realmente importa: cadastrar o restaurante
  let restaurant;

  try {
    restaurant = await prisma.restaurant.create({
      data: {
        ...validated,
        ownerId: user.id // ⬅️ grava o dono (quem está logado, vindo do token)
      }
    });
  } catch (error) {
    // Dois cadastros simultâneos podem passar pela checagem acima:
    // o índice único do banco é a garantia final
    if (error.code === "P2002") {
      throw httpError(409, DUPLICATE_NAME_MESSAGE);
    }
    throw error;
  }

  // 2) Ações secundárias — cada uma isolada por try/catch.
  //    Se qualquer uma falhar, o cadastro NÃO é afetado.

  // E-mail de boas-vindas (usa o serviço genérico)
  try {
    await emailService.sendEmail({
      to: user.email, // e-mail de quem cadastrou (vindo do token)
      toName: restaurant.name,
      subject: `Bem-vindo à EasyFood, ${restaurant.name}!`,
      header: `Olá, ${restaurant.name}!`,
      body: `Seu restaurante <strong>${restaurant.name}</strong> foi cadastrado com sucesso na EasyFood. Categoria: ${restaurant.category}.`,
      footer: "Equipe EasyFood"
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de boas-vindas:", error.message);
  }

  // Registro da atividade
  try {
    await activityService.log("RESTAURANT_CREATED", `Restaurante: ${restaurant.name}`);
  } catch (error) {
    console.error("Erro ao registrar atividade:", error.message);
  }

  // Alerta para o comercial (MESMA função genérica, outro conteúdo)
  try {
    await emailService.sendEmail({
      to: COMERCIAL_EMAIL,
      toName: "Comercial EasyFood",
      subject: `Novo restaurante cadastrado: ${restaurant.name}`,
      header: "Novo restaurante na plataforma",
      body: `Nome: ${restaurant.name}<br/>Categoria: ${restaurant.category}<br/>Avaliação: ${restaurant.rating}`,
      footer: "Notificação automática — EasyFood"
    });
  } catch (error) {
    console.error("Erro ao notificar o comercial:", error.message);
  }

  await notificationService.notifyUsers([user.id], {
    type: "RESTAURANT_CREATED",
    title: "Restaurante cadastrado",
    message: `${restaurant.name} já está disponível na EasyFood.`
  });

  // 3) O restaurante volta independente do resultado das ações acima
  return restaurant;

  // --- Envio de sms função 
}


// --------createrestaurant.event

module.exports = {
  listRestaurants,
  createRestaurant
};