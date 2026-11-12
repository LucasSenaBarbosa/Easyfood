const multer = require("multer");

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// O arquivo fica em memória porque o image.service é quem decide como gravar
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(null, true);
    }

    const error = new Error("Formato não suportado. Envie JPEG, PNG ou WebP");
    error.statusCode = 415;
    return callback(error);
  }
});

function describeError(error) {
  if (error.statusCode) {
    return { status: error.statusCode, message: error.message };
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return { status: 413, message: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB} MB` };
  }

  return { status: 400, message: "Envio inválido. Mande um único arquivo no campo do formulário" };
}

// Recebe um arquivo em req.file e responde com o erro HTTP adequado quando falha
function uploadImage(fieldName = "image") {
  const receiveFile = upload.single(fieldName);

  return (req, res, next) => {
    receiveFile(req, res, (error) => {
      if (error) {
        const { status, message } = describeError(error);
        return res.status(status).json({ error: message });
      }

      if (!req.file) {
        return res.status(400).json({ error: `Envie a imagem no campo "${fieldName}"` });
      }

      return next();
    });
  };
}

module.exports = { uploadImage };
