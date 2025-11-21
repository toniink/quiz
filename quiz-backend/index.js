const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database.js'); // Nosso banco
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');
const SECRET_KEY = 'pipoca'; // Mude isso em produção!

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// =====================================================
// 1. AUTENTICAÇÃO (ROTAS PÚBLICAS)
// =====================================================

// ROTA DE CADASTRO
app.post('/register', async (req, res) => {
  console.log('--> Nova tentativa de registro:', req.body.email);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Este e-mail já está em uso' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        SECRET_KEY,
        { expiresIn: '8h' }
      );
      res.status(200).json({ 
        message: 'Login bem-sucedido!',
        token: token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});

// =====================================================
// 2. DASHBOARD (PROTEGIDO)
// =====================================================

app.get('/dashboard', authMiddleware, (req, res) => {
  const userId = req.user.id;
  let response = { folders: [], quizzes: [] };

  const folderQuery = "SELECT * FROM folders WHERE userId = ?";
  db.all(folderQuery, [userId], (err, folders) => {
    if (err) return res.status(500).json({ error: err.message });
    response.folders = folders;

    // Busca TODOS os quizzes do usuário (não filtra mais os que têm pasta)
    const quizQuery = "SELECT * FROM quizzes WHERE userId = ?";

    db.all(quizQuery, [userId], (err, quizzes) => {
      if (err) return res.status(500).json({ error: err.message });
      response.quizzes = quizzes;
      res.json(response);
    });
  });
});

// =====================================================
// 3. GESTÃO DE PASTAS (PROTEGIDO)
// =====================================================

// Listar todas as pastas
app.get('/folders', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM folders WHERE userId = ?";
  db.all(sql, [userId], (err, folders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(folders);
  });
});

// Criar Pasta
app.post('/folders', authMiddleware, (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  if (!name) {
    return res.status(400).json({ error: 'O nome da pasta é obrigatório' });
  }
  const sql = 'INSERT INTO folders (name, userId) VALUES (?, ?)';
  db.run(sql, [name, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name: name, userId: userId });
  });
});

// Deletar Pasta (Remove a pasta, mas mantém os quizzes graças à tabela de junção)
app.delete('/folders/:id', authMiddleware, (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  const sql = "DELETE FROM folders WHERE id = ? AND userId = ?";
  db.run(sql, [folderId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Pasta não encontrada" });
    res.status(200).json({ message: 'Pasta deletada com sucesso' });
  });
});

// Detalhes da Pasta + Seus Quizzes
app.get('/folders/:id', authMiddleware, (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  let response = { folder: null, quizzes: [] };

  const folderSql = "SELECT * FROM folders WHERE id = ? AND userId = ?";
  db.get(folderSql, [folderId, userId], (err, folder) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!folder) return res.status(404).json({ error: 'Pasta não encontrada' });
    response.folder = folder;

    // Busca quizzes via tabela de junção
    const quizzesSql = `
      SELECT q.* FROM quizzes q
      JOIN quiz_folders qf ON q.id = qf.quizId
      WHERE qf.folderId = ? AND q.userId = ?
    `;
    db.all(quizzesSql, [folderId, userId], (err, quizzes) => {
      if (err) return res.status(500).json({ error: err.message });
      response.quizzes = quizzes;
      res.json(response);
    });
  });
});

// ROTA: REMOVER MÚLTIPLAS PASTAS (BULK DELETE)
app.post('/folders/bulk_delete', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { folderIds } = req.body; 

  if (!folderIds || !Array.isArray(folderIds) || folderIds.length === 0) {
    return res.status(400).json({ error: "Lista de pastas inválida" });
  }

  // Deleta apenas pastas que pertencem ao usuário
  const placeholders = folderIds.map(() => '?').join(',');
  const sql = `DELETE FROM folders WHERE userId = ? AND id IN (${placeholders})`;
  const params = [userId, ...folderIds];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `${this.changes} pastas deletadas.` });
  });
});

// --- ROTA: REMOVER QUIZZES DA PASTA (BULK ACTION) ---
app.post('/folders/:id/remove_quizzes', authMiddleware, (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  const { quizIds } = req.body; // Espera array [1, 2, 3]

  if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) {
    return res.status(400).json({ error: "Lista de quizzes inválida" });
  }

  // Verifica propriedade da pasta
  db.get("SELECT id FROM folders WHERE id = ? AND userId = ?", [folderId, userId], (err, folder) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!folder) return res.status(404).json({ error: "Pasta não encontrada" });

    // Remove associações
    const placeholders = quizIds.map(() => '?').join(',');
    const sql = `DELETE FROM quiz_folders WHERE folderId = ? AND quizId IN (${placeholders})`;
    const params = [folderId, ...quizIds];

    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `${this.changes} quizzes removidos da pasta.` });
    });
  });
});

// =====================================================
// 4. GESTÃO DE QUIZZES (PROTEGIDO)
// =====================================================

// Criar Quiz
app.post('/quizzes', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { title, timePerQuestion, folderIds, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ error: "Título e perguntas obrigatórios" });
  }

  db.serialize(() => {
    // 1. Cria o Quiz
    const quizSql = `INSERT INTO quizzes (title, timePerQuestion, userId) VALUES (?, ?, ?)`;
    db.run(quizSql, [title, timePerQuestion || 0, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const quizId = this.lastID;

      // 2. Associa às Pastas (se houver)
      if (folderIds && Array.isArray(folderIds) && folderIds.length > 0) {
        const assocSql = `INSERT INTO quiz_folders (quizId, folderId) VALUES (?, ?)`;
        folderIds.forEach(folderId => {
          db.run(assocSql, [quizId, folderId]);
        });
      }

      // 3. Cria Perguntas e Opções
      const questionSql = `INSERT INTO questions (questionText, quizId) VALUES (?, ?)`;
      const optionSql = `INSERT INTO options (optionText, isCorrect, questionId) VALUES (?, ?, ?)`;

      questions.forEach(q => {
        db.run(questionSql, [q.questionText, quizId], function(err) {
          if (err) return console.error(err);
          const questionId = this.lastID;
          q.options.forEach(o => {
            db.run(optionSql, [o.optionText, o.isCorrect ? 1 : 0, questionId]);
          });
        });
      });
      
      res.status(201).json({ message: "Quiz criado com sucesso!", quizId: quizId });
    });
  });
});

// Buscar Detalhes do Quiz (para Editar/Jogar)
app.get('/quizzes/:id', authMiddleware, (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;

  const quizSql = "SELECT * FROM quizzes WHERE id = ? AND userId = ?";
  db.get(quizSql, [quizId, userId], (err, quiz) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!quiz) return res.status(404).json({ error: "Quiz não encontrado" });

    // 1. Busca perguntas e opções
    const questionsSql = "SELECT * FROM questions WHERE quizId = ?";
    db.all(questionsSql, [quizId], async (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });

      // 2. Busca pastas associadas (para preencher os switches na edição)
      const folderIdsSql = "SELECT folderId FROM quiz_folders WHERE quizId = ?";
      db.all(folderIdsSql, [quizId], async (err, folderLinks) => {
        if (err) return res.status(500).json({ error: err.message });
        
        quiz.folderIds = folderLinks.map(f => f.folderId);

        const fullQuestions = await Promise.all(
          questions.map(q => {
            return new Promise((resolve, reject) => {
              const optionsSql = "SELECT * FROM options WHERE questionId = ?";
              db.all(optionsSql, [q.id], (err, options) => {
                if (err) reject(err);
                resolve({ ...q, options: options });
              });
            });
          })
        );
        
        quiz.questions = fullQuestions; 
        res.json(quiz);
      });
    });
  });
});

// Atualizar Quiz
app.put('/quizzes/:id', authMiddleware, (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;
  const { title, timePerQuestion, folderIds, questions } = req.body;

  db.serialize(() => {
    // 1. Atualiza dados básicos
    const updateSql = `UPDATE quizzes SET title = ?, timePerQuestion = ? WHERE id = ? AND userId = ?`;
    db.run(updateSql, [title, timePerQuestion || 0, quizId, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Quiz não encontrado" });
    });

    // 2. Limpa associações antigas de pastas
    db.run("DELETE FROM quiz_folders WHERE quizId = ?", [quizId]);

    // 3. Recria associações de pastas
    if (folderIds && Array.isArray(folderIds)) {
      const assocSql = `INSERT INTO quiz_folders (quizId, folderId) VALUES (?, ?)`;
      folderIds.forEach(folderId => {
        db.run(assocSql, [quizId, folderId]);
      });
    }

    // 4. Limpa perguntas antigas
    db.run("DELETE FROM questions WHERE quizId = ?", [quizId]);

    // 5. Recria perguntas e opções
    const questionSql = `INSERT INTO questions (questionText, quizId) VALUES (?, ?)`;
    const optionSql = `INSERT INTO options (optionText, isCorrect, questionId) VALUES (?, ?, ?)`;

    questions.forEach(q => {
      db.run(questionSql, [q.questionText, quizId], function(err) {
        if (err) return console.error(err);
        const questionId = this.lastID;
        q.options.forEach(o => {
          db.run(optionSql, [o.optionText, o.isCorrect ? 1 : 0, questionId]);
        });
      });
    });

    res.status(200).json({ message: "Quiz atualizado com sucesso!" });
  });
});

// Deletar Quiz
app.delete('/quizzes/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.id;
  const sql = "DELETE FROM quizzes WHERE id = ? AND userId = ?";
  db.run(sql, [quizId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Quiz não encontrado" });
    res.status(200).json({ message: 'Quiz deletado com sucesso' });
  });
});

// 5. GESTÃO DE PERFIL (NOVO)

// Atualizar Perfil (Nome e Senha)
app.put('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { username, password } = req.body;

  db.serialize(async () => {
    // 1. Atualiza o nome
    if (username) {
      db.run("UPDATE users SET username = ? WHERE id = ?", [username, userId]);
    }

    // 2. Atualiza a senha (se fornecida)
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
    }

    res.json({ message: "Perfil atualizado com sucesso!" });
  });
});

// DELETAR CONTA (PERIGO!)
app.delete('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Graças ao ON DELETE CASCADE configurado no database.js,
  // apagar o user apaga automaticamente seus quizzes e pastas.
  db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Conta excluída permanentemente." });
  });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;