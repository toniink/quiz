import random
import string
from locust import HttpUser, task, between

class QuizUser(HttpUser):
    # Tempo de espera entre uma tarefa e outra (simula o "pensar" do humano)
    # Aqui o usuário espera entre 1 e 5 segundos entre cliques
    wait_time = between(1, 5)
    
    token = None

    def on_start(self):
        """
        Executado quando um usuário virtual 'nasce'.
        Vamos registrar um usuário único e fazer login para pegar o Token.
        """
        # Gera um email aleatório para não colidir no banco de dados
        random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"user_{random_id}@teste.com"
        password = "123"
        username = f"User {random_id}"

        # 1. Tenta Registrar
        self.client.post("/register", json={
            "username": username,
            "email": email,
            "password": password
        })

        # 2. Faz Login para pegar o Token
        response = self.client.post("/login", json={
            "email": email,
            "password": password
        })

        if response.status_code == 200:
            self.token = response.json().get("token")
        else:
            print(f"Erro ao logar: {response.text}")

    @task(3) # Peso 3: É 3x mais provável de acontecer que a tarefa de peso 1
    def ver_dashboard(self):
        """
        Simula o usuário carregando a tela inicial.
        """
        if not self.token: return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/dashboard", headers=headers)

    @task(1) # Peso 1: Acontece com menos frequência
    def criar_quiz(self):
        """
        Simula o usuário criando um quiz.
        """
        if not self.token: return

        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Dados do Quiz fake
        payload = {
            "title": "Quiz de Carga Locust",
            "timePerQuestion": 30,
            "folderIds": [], # Opcional: coloque IDs reais se tiver certeza que existem
            "questions": [
                {
                    "questionText": "O Locust é rápido?",
                    "options": [
                        {"optionText": "Sim", "isCorrect": True},
                        {"optionText": "Não", "isCorrect": False}
                    ]
                }
            ]
        }

        self.client.post("/quizzes", json=payload, headers=headers)