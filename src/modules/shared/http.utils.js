// Erro com status HTTP que os controllers sabem responder
function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw httpError(400, "Identificador inválido");
  }

  return id;
}

function handleError(res, error) {
  const status = error.statusCode || 500;

  if (status === 500) {
    console.error("Erro interno:", error.message);
  }

  return res.status(status).json({
    error: status === 500 ? "Erro interno no servidor" : error.message
  });
}

module.exports = { httpError, parseId, handleError };
