// quiz-backend/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'sua-chave-secreta-muito-segura'; // A mesma chave!

module.exports = function(req, res, next) {
  const authHeader = req.headers['authorization'];
  // O token vem no formato "Bearer [token]"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Acesso negado (sem token)' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    // Adiciona os dados do usuário (do token) ao objeto 'req'
    req.user = user;
    next(); // Continua para a rota
  });
};