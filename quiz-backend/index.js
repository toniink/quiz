// index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database.js'); // Nosso banco
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');
const SECRET_KEY = 'pipoca'; // Mude isso!


const app = express();
const PORT = 4000; // Porta do backend

// Middlewares
app.use(cors()); // Permite requisições de outras origens (seu app Expo)
app.use(express.json()); // Permite ao Express entender JSON

// --- ROTA DE CADASTRO ---
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o "salt rounds"

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        // 'UNIQUE constraint failed' significa que o email já existe
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

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Usuário não encontrado
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Compara a senha enviada com o hash salvo no banco
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      // SUCESSO! Gere o Token.
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        SECRET_KEY,
        { expiresIn: '8h' } // Token expira em 8 horas
      );

      res.status(200).json({ 
        message: 'Login bem-sucedido!',
        token: token, // Envia o token para o cliente
        user: { id: user.id, username: user.username, email: user.email }
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});

// --- ROTAS PROTEGIDAS (Exigem Login/Token) ---

// Rota para buscar todos os Quizzes e Pastas do usuário
// (Implementa "Agrupamento por Pastas")
app.get('/dashboard', authMiddleware, (req, res) => {
  const userId = req.user.id; // Pegamos o ID do usuário (do token)
  let response = {
    folders: [],
    quizzes: [] // Quizzes sem pasta
  };

  const folderQuery = "SELECT * FROM folders WHERE userId = ?";
  db.all(folderQuery, [userId], (err, folders) => {
    if (err) return res.status(500).json({ error: err.message });
    response.folders = folders;

    // Busca quizzes que NÃO estão em pastas (folderId é NULL)
    const quizQuery = "SELECT * FROM quizzes WHERE userId = ? AND folderId IS NULL";
    db.all(quizQuery, [userId], (err, quizzes) => {
      if (err) return res.status(500).json({ error: err.message });
      response.quizzes = quizzes;
      res.json(response);
    });
  });
});

// Rota para buscar Quizzes DE UMA PASTA
// (Implementa "Filtragem")
app.get('/folders/:id/quizzes', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const folderId = req.params.id;
  
  const sql = "SELECT * FROM quizzes WHERE userId = ? AND folderId = ?";
  db.all(sql, [userId, folderId], (err, quizzes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(quizzes);
  });
});


// Rota para DELETAR um Quiz
// (Implementa "Funcionalidade de Deleção")
app.delete('/quizzes/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.id;

  // Deleta o quiz APENAS se ele pertencer ao usuário logado
  const sql = "DELETE FROM quizzes WHERE id = ? AND userId = ?";
  db.run(sql, [quizId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      // Nenhum quiz foi deletado (ou não pertence ao usuário ou não existe)
      return res.status(404).json({ error: "Quiz não encontrado ou não autorizado" });
    }
    // As perguntas e alternativas são deletadas automaticamente (ON DELETE CASCADE)
    res.status(200).json({ message: 'Quiz deletado com sucesso' });
  });
});

// ROTA PARA CRIAR UM NOVO QUIZ (Fluxo de Criação de Quiz)
app.post('/quizzes', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { title, timePerQuestion, folderId, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ error: "Título e pelo menos uma pergunta são obrigatórios" });
  }

  db.serialize(() => {
    const quizSql = `INSERT INTO quizzes (title, timePerQuestion, userId, folderId) VALUES (?, ?, ?, ?)`;
    
    db.run(quizSql, [title, timePerQuestion || 0, userId, folderId || null], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const quizId = this.lastID; 

      const questionSql = `INSERT INTO questions (questionText, quizId) VALUES (?, ?)`;
      const optionSql = `INSERT INTO options (optionText, isCorrect, questionId) VALUES (?, ?, ?)`;

      questions.forEach(q => {
        db.run(questionSql, [q.questionText, quizId], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          
          const questionId = this.lastID;

          q.options.forEach(o => {
            db.run(optionSql, [o.optionText, o.isCorrect ? 1 : 0, questionId], (err) => {
              if (err) return res.status(500).json({ error: err.message });
            });
          });
        });
      });
      
      res.status(201).json({ message: "Quiz criado com sucesso!", quizId: quizId });
    });
  });
});

// ROTA PARA BUSCAR OS DETALHES DE UM QUIZ (para Jogar ou Editar)
app.get('/quizzes/:id', authMiddleware, (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;

  const quizSql = "SELECT * FROM quizzes WHERE id = ? AND userId = ?";
  
  db.get(quizSql, [quizId, userId], (err, quiz) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!quiz) return res.status(404).json({ error: "Quiz não encontrado" });

    // 1. Achamos o quiz, agora buscamos as perguntas
    const questionsSql = "SELECT * FROM questions WHERE quizId = ?";
    db.all(questionsSql, [quizId], async (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });

      // 2. Para cada pergunta, buscamos as alternativas
      // Usamos Promise.all para lidar com as chamadas assíncronas em loop
      const fullQuestions = await Promise.all(
        questions.map(q => {
          return new Promise((resolve, reject) => {
            const optionsSql = "SELECT * FROM options WHERE questionId = ?";
            db.all(optionsSql, [q.id], (err, options) => {
              if (err) reject(err);
              // (Teste Unitário: shuffleArray) Você pode embaralhar as 'options' aqui se quiser
              resolve({ ...q, options: options });
            });
          });
        })
      );
      
      // (Teste Unitário: shuffleArray) Você pode embaralhar as 'fullQuestions' aqui
      // quiz.questions = shuffleArray(fullQuestions);
      quiz.questions = fullQuestions; 
      
      res.json(quiz);
    });
  });
});


// ROTA PARA ATUALIZAR UM QUIZ (Fluxo de Edição)
app.put('/quizzes/:id', authMiddleware, (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;
  const { title, timePerQuestion, folderId, questions } = req.body;

  // Para edição, a estratégia mais simples é "Nuke and Pave":
  // 1. Deletar todas as perguntas/alternativas antigas
  // 2. Atualizar os dados do quiz (título, etc.)
  // 3. Recriar as perguntas/alternativas (mesma lógica do POST)

  db.serialize(() => {
    // 1. Atualiza o Quiz principal
    const updateSql = `UPDATE quizzes SET title = ?, timePerQuestion = ?, folderId = ? 
                       WHERE id = ? AND userId = ?`;
    db.run(updateSql, [title, timePerQuestion || 0, folderId || null, quizId, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Quiz não encontrado ou não autorizado"});
    });

    // 2. Deleta todas as perguntas antigas (ON DELETE CASCADE cuidará das alternativas)
    const deleteSql = "DELETE FROM questions WHERE quizId = ?";
    db.run(deleteSql, [quizId]);

    // 3. Recria (mesma lógica do POST)
    const questionSql = `INSERT INTO questions (questionText, quizId) VALUES (?, ?)`;
    const optionSql = `INSERT INTO options (optionText, isCorrect, questionId) VALUES (?, ?, ?)`;

    questions.forEach(q => {
      db.run(questionSql, [q.questionText, quizId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const questionId = this.lastID;
        q.options.forEach(o => {
          db.run(optionSql, [o.optionText, o.isCorrect ? 1 : 0, questionId]);
        });
      });
    });

    res.status(200).json({ message: "Quiz atualizado com sucesso!" });
  });
});




// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});