const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { httpError } = require("./http.utils");

// Pasta física das imagens e prefixo público (servido em src/app.js)
const UPLOAD_ROOT = path.resolve(__dirname, "../../../uploads");
const PUBLIC_PREFIX = "/uploads";

const SUPPORTED_FORMATS = ["jpeg", "png", "webp"];

// Otimiza a imagem: confere o conteúdo real (não só o mimetype enviado pelo
// cliente), corrige a rotação, redimensiona e converte para WebP.
async function optimize(buffer, { width, height, quality = 80 }) {
  let metadata;
  let optimized;

  try {
    metadata = await sharp(buffer).metadata();

    if (SUPPORTED_FORMATS.includes(metadata.format)) {
      optimized = await sharp(buffer)
        .rotate()
        .resize(width, height, { fit: "cover", withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }
  } catch (error) {
    throw httpError(400, "O arquivo enviado não é uma imagem válida");
  }

  if (!optimized) {
    throw httpError(415, "Formato não suportado. Envie JPEG, PNG ou WebP");
  }

  return optimized;
}

// Otimiza e grava em disco. Devolve o caminho público que vai para o banco.
async function optimizeAndStore(buffer, { folder, ...options }) {
  const optimized = await optimize(buffer, options);
  const fileName = `${crypto.randomUUID()}.webp`;
  const directory = path.join(UPLOAD_ROOT, folder);

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, fileName), optimized);

  return `${PUBLIC_PREFIX}/${folder}/${fileName}`;
}

// Remove uma imagem gravada. Falhar aqui nunca deve derrubar a operação principal.
async function removeImage(imagePath) {
  if (!imagePath || !imagePath.startsWith(`${PUBLIC_PREFIX}/`)) {
    return;
  }

  const absolutePath = path.resolve(UPLOAD_ROOT, imagePath.slice(PUBLIC_PREFIX.length + 1));

  if (!absolutePath.startsWith(UPLOAD_ROOT + path.sep)) {
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Erro ao remover imagem:", error.message);
    }
  }
}

// Fluxo único usado por qualquer módulo:
// 1) otimiza e grava a nova imagem; 2) o módulo salva o caminho no banco (persist);
// 3) se o banco falhar, apaga a imagem nova; se der certo, apaga a antiga.
async function replaceImage({ buffer, folder, width, height, previousPath, persist }) {
  const imagePath = await optimizeAndStore(buffer, { folder, width, height });

  let result;
  try {
    result = await persist(imagePath);
  } catch (error) {
    await removeImage(imagePath);
    throw error;
  }

  await removeImage(previousPath);
  return result;
}

module.exports = { UPLOAD_ROOT, PUBLIC_PREFIX, optimizeAndStore, removeImage, replaceImage };
