
const request = require('supertest');
const app = require('./index'); // Importa o app que exportamos

describe('Testes de Integração - API Backend', () => {
  
  let userToken = '';
  const testUser = {
    username: 'TestUser',
    email: `test_${Date.now()}@email.com`, // Email único por teste
    password: '123'
  };

  // 1. Testa o Registro (Caminho Feliz)
  test('POST /register - Deve criar um novo usuário', async () => {
    const res = await request(app)
      .post('/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('userId');
  });

  // 2. Testa o Login (Caminho Feliz)
  test('POST /login - Deve retornar um token JWT', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    userToken = res.body.token; // Salva o token para o próximo teste
  });

  // 3. Testa Rota Protegida (Acesso ao Dashboard)
  test('GET /dashboard - Deve acessar com token válido', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${userToken}`); // Envia o token no header

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('folders');
    expect(res.body).toHaveProperty('quizzes');
  });

  // 4. Testa Rota Protegida (Acesso Negado)
  test('GET /dashboard - Deve falhar sem token', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toEqual(401); // Unauthorized
  });
});