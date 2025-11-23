# 🧩 Quiz – Testes e Automação de Software

Aplicação: Quiz com Autenticação, CRUD Completo e Relacionamentos
---

## 📝 Descrição
Este repositório contém o desenvolvimento do projeto solicitado na disciplina Testes e Automação de Software – ESBAM, ministrada pelo Prof. MSc. Ronilson Cavalcante da Silva.
Aplicação web desenvolvida para apresentar um quiz interativo, permitindo que o usuário responda perguntas e visualize seu desempenho ao final. O projeto foi criado com fins educacionais, visando praticar conceitos de desenvolvimento web, organização de código, versionamento e colaboração em equipe.

O projeto implementa uma aplicação completa com:
-	Autenticação simples (login e registro)
-	CRUD de Quizzes
-	CRUD de Pastas
-	Relacionamento M:N (muitos-para-muitos) entre quizzes e pastas
-	Backend com Node.js + Express + SQLite
-	Frontend mobile e web com React Native (Expo)
-	Testes de Sistema documentados
-	Automação E2E com Selenium + pytest
-	Testes de Performance com Locust

---
## ✨ Funcionalidades
-	Exibição de perguntas de múltipla escolha.
-	Validação automática das respostas.
-	Contagem de acertos.
-	Interface simples e intuitiva.
-	Navegação entre perguntas.

---

## 🛠️ Tecnologias Utilizadas
### ⚙️ BACKEND
-	Node.js
-	Express.js
-	SQLite3
-	JWT (jsonwebtoken)
-	Bcrypt.js
-	CORS

### 📱FRONTEN
-	React Native (Expo)
-	React Navigation
-	Context API

### 🤖 TESTES
-	Testes de Sistema: roteiro + casos documentados
-   Jest
-	Automação:
    - Selenium WebDriver
    -	Python
-	Performance:
    -	Locust

---
## 📂 ESTRUTURA DO REPOSITÓRIO
```
src/  
├── components/         # Componentes visuais reutilizáveis  
│   ├── DashboardHeader.js  
│   ├── HamburgerMenu.js  
│   ├── StyledButton.js  
│   └── ConfirmationModal.js  
├── constants/          # Configurações estáticas  
│   └── theme.js        # Paletas de cores (Dark/Light) e fontes  
├── context/            # Gestão de estado global  
│   ├── AuthContext.js  # Login, Logout, Token  
│   └── ThemeContext.js # Controle Dark/Light Mode  
├── navigation/         # Configuração de rotas  
│   └── AppNavigator.js # Stack Navigator  
├── screens/            # Telas da aplicação  
│   ├── DashboardScreen.js  
│   ├── CreateEditQuizScreen.js  
│   ├── FoldersListScreen.js  
│   ├── FolderScreen.js  
│   ├── PlayQuizScreen.js  
│   ├── ResultsScreen.js  
│   ├── LoginScreen.js  
│   ├── RegisterScreen.js  
│   ├── ProfileScreen.js  
│   └── HelpScreen.js  
├── services/           # Comunicação com Backend  
│   └── api.js          # Configuração Axios e Endpoints  
└── utils/              # Lógica pura e helpers  
    ├── quizLogic.js  
    ├── validators.js  
    └── helpers.js 
 ```  
---

##  Como Executar o Backend
1.	Instale as dependências:
npm install
2.	Execute o servidor:
node index.js
3.	Backend disponível em:
http://localhost:4000

## Como Executar o Aplicativo (Frontend)
1.	Instale dependências:
npm install
2.	Inicie o Expo:
npx expo start
3.	Abra no celular via QR Code/emulador ou web.

## Testes Automatizados
1) Testes de Sistema
   - São rodados com `npm test`.

3) Testes de Performance (Locust)  
Executar:  
`python -m locust -f locustfile.py --host http://localhost:4000`  
Acessar interface gráfica:  
http://localhost:4000  
Cenários avaliados:  
-	Carga de usuários simultâneos  
-	Latência de criação de quiz  
-	Latência de login  
-	Taxas de erro  
---
## 📸 EVIDÊNCIAS
Localizadas em:
/evidence
Incluem:
-	Prints
-	Relatórios de performance Locust

---
## STATUS DO PROJETO
Em desenvolvimento.
👥 AUTORES
-	Antonio Tavares
-	Marcele Rodrigues
---
## 🏫 INSTITUIÇÃO
UNIESBAM – Escola Superior Batista do Amazonas
Disciplina: Testes e Automação de Software
Professor: Prof. MSc. Ronilson Cavalcante da Silva
Período: Outubro–Novembro/2025
---
## 📜 LICENÇA
Este projeto é de uso acadêmico.
