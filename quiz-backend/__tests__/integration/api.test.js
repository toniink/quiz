const request = require('supertest');
const app = require('../../index'); // Importa o app
const db = require('../../database'); // Importa o banco

// Variáveis globais
let token = '';
let userId = 0;
let folderId = 0;
let quizId = 0;

// Dados de teste
const testUser = {
  username: 'Tester Integração',
  email: `teste_${Date.now()}@integracao.com`,
  password: 'senha_secreta'
};

// Função auxiliar para limpar o banco (BLINDADA CONTRA ERROS)
const clearDatabase = () => {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Passamos callbacks vazios () => {} para ignorar erros caso a tabela não exista
      db.run("DELETE FROM quiz_folders", () => {});
      db.run("DELETE FROM options", () => {});
      db.run("DELETE FROM questions", () => {});
      db.run("DELETE FROM quizzes", () => {});
      db.run("DELETE FROM folders", () => {});
      db.run("DELETE FROM users", () => resolve());
    });
  });
};

describe('Testes de Integração da API (Backend)', () => {

  // CORREÇÃO CRÍTICA AQUI:
  beforeAll(async () => {
    // 1. Espera 1 segundo para garantir que o SQLite criou as tabelas na memória
    await new Promise(r => setTimeout(r, 1000));
    
    // 2. Agora sim, limpa qualquer lixo (se houver)
    await clearDatabase();
  });

  // --- 1. AUTENTICAÇÃO ---
  describe('1. Autenticação', () => {
    it('Deve registar um novo utilizador com sucesso', async () => {
      const res = await request(app).post('/register').send(testUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('userId');
      userId = res.body.userId;
    });

    it('Deve fazer login e retornar um Token JWT', async () => {
      const res = await request(app).post('/login').send({
          email: testUser.email,
          password: testUser.password
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
  });

  // --- 2. GESTÃO DE PASTAS ---
  describe('2. Gestão de Pastas', () => {
    it('Deve criar uma pasta "Matemática"', async () => {
      const res = await request(app)
        .post('/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Matemática' });

      expect(res.statusCode).toEqual(201);
      folderId = res.body.id;
    });
  });

  // --- 3. GESTÃO DE QUIZZES ---
  describe('3. Gestão de Quizzes', () => {
    it('Deve criar um Quiz e associá-lo à Pasta', async () => {
      const quizPayload = {
        title: 'Quiz Teste',
        timePerQuestion: 30,
        folderIds: [folderId],
        questions: [
          {
            questionText: 'Teste?',
            options: [
              { optionText: 'Sim', isCorrect: true },
              { optionText: 'Não', isCorrect: false }
            ]
          }
        ]
      };

      const res = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send(quizPayload);

      expect(res.statusCode).toEqual(201);
      quizId = res.body.quizId;
    });

    it('Deve verificar se o Quiz foi salvo corretamente', async () => {
      const res = await request(app)
        .get(`/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe('Quiz Teste');
      expect(res.body.folderIds).toContain(folderId);
    });

    it('Deve apagar o quiz', async () => {
        const res = await request(app)
          .delete(`/quizzes/${quizId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
  });
});