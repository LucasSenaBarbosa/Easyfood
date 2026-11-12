const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");
const notificationService = require("../notifications/notification.service");

const JWT_SECRET = process.env.JWT_SECRET;

// Dados do usuário que podem sair da API (nunca a senha)
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl };
}

// Cadastro: guarda o usuário com a senha em hash
async function register({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hash }
  });

  await notificationService.notifyUsers([user.id], {
    type: "WELCOME",
    title: "Bem-vindo à EasyFood!",
    message: "Explore os restaurantes, salve seus favoritos e monte seu pedido."
  });

  // Nunca devolvemos a senha
  return toPublicUser(user);
}

// Login: confere o e-mail, compara a senha e gera o token
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null; // usuário não existe
  }

  const senhaConfere = await bcrypt.compare(password, user.password);

  if (!senhaConfere) {
    return null; // senha errada
  }

  // Gera o token com o id e email do usuário, válido por 1 dia
  const token = jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: toPublicUser(user) };
}

// Busca os dados atualizados do usuário no banco (sem a senha)
async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

// Troca a foto do usuário autenticado usando o serviço compartilhado
async function updateProfileImage(userId, buffer) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.statusCode = 404;
    throw error;
  }

  return imageService.replaceImage({
    buffer,
    folder: "users",
    width: 400,
    height: 400,
    previousPath: user.imageUrl,
    persist: async (imageUrl) => {
      const updated = await prisma.user.update({ where: { id: userId }, data: { imageUrl } });
      return toPublicUser(updated);
    }
  });
}

module.exports = { register, login, getById, updateProfileImage };