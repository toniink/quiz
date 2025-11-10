// quiz-backend/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) {
    return console.error('Erro ao abrir o banco de dados', err.message);
  }
  
  console.log('Conectado ao banco de dados SQLite.');

  db.serialize(() => {
    // Tabela de Usuários (Existente)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    // Tabela de Pastas (Nova)
    // ('userId' vincula a pasta ao usuário)
    db.run(`CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )`);

// Tabela de Quizzes (MODIFICADA)
    // 'folderId' foi REMOVIDO daqui
    db.run(`CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      timePerQuestion INTEGER DEFAULT 0,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )`);

    // Tabela de Perguntas (SEM MUDANÇA)
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionText TEXT NOT NULL,
      quizId INTEGER NOT NULL,
      FOREIGN KEY (quizId) REFERENCES quizzes (id) ON DELETE CASCADE
    )`);

    // Tabela de Alternativas (SEM MUDANÇA)
    // 'isCorrect' = 1 (true) ou 0 (false)
    db.run(`CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      optionText TEXT NOT NULL,
      isCorrect INTEGER NOT NULL DEFAULT 0,
      questionId INTEGER NOT NULL,
      FOREIGN KEY (questionId) REFERENCES questions (id) ON DELETE CASCADE
    )`);

    // Tabela de Junção (NOVA)
    // Conecta Quizzes e Pastas
    db.run(`CREATE TABLE IF NOT EXISTS quiz_folders (
      quizId INTEGER NOT NULL,
      folderId INTEGER NOT NULL,
      PRIMARY KEY (quizId, folderId),
      FOREIGN KEY (quizId) REFERENCES quizzes (id) ON DELETE CASCADE,
      FOREIGN KEY (folderId) REFERENCES folders (id) ON DELETE CASCADE
    )`);

    
  });
});

module.exports = db;