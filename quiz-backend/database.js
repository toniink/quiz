const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    
    // ATIVA AS CHAVES ESTRANGEIRAS (Crucial para ON DELETE CASCADE)
    db.run("PRAGMA foreign_keys = ON");

    db.serialize(() => {
      // Tabela de Usuários
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`);

      // Tabela de Pastas
      db.run(`CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        userId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )`);

      // Tabela de Quizzes (SEM folderId, pois é M:N)
      db.run(`CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        timePerQuestion INTEGER DEFAULT 0,
        userId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )`);

      // Tabela de Junção (M:N)
      db.run(`CREATE TABLE IF NOT EXISTS quiz_folders (
        quizId INTEGER NOT NULL,
        folderId INTEGER NOT NULL,
        PRIMARY KEY (quizId, folderId),
        FOREIGN KEY (quizId) REFERENCES quizzes (id) ON DELETE CASCADE,
        FOREIGN KEY (folderId) REFERENCES folders (id) ON DELETE CASCADE
      )`);

      // Tabela de Perguntas
      db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        questionText TEXT NOT NULL,
        quizId INTEGER NOT NULL,
        FOREIGN KEY (quizId) REFERENCES quizzes (id) ON DELETE CASCADE
      )`);

      // Tabela de Alternativas
      db.run(`CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        optionText TEXT NOT NULL,
        isCorrect INTEGER NOT NULL DEFAULT 0,
        questionId INTEGER NOT NULL,
        FOREIGN KEY (questionId) REFERENCES questions (id) ON DELETE CASCADE
      )`);
    });
  }
});

module.exports = db;