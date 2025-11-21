import random
import string
from locust import HttpUser, task, between

class QuizUser(HttpUser):
    # Tempo de espera entre tarefas (simula o tempo de leitura/clique do usuário)
    # O usuário espera entre 1 e 5 segundos antes de fazer a próxima ação
    wait_time = between(1, 5)
    
    token = None

    def on_start(self):
        """
        Executado quando um usuário virtual inicia.
        Registra um usuário único e faz login para obter o Token JWT.
        """
        # Gera string aleatória para evitar erro de email duplicado
        random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"user_{random_id}@teste.com"
        password = "123"
        username = f"User {random_id}"

        # 1. Registrar Usuário
        with self.client.post("/register", json={
            "username": username,
            "email": email,
            "password": password
        }, catch_response=True) as response:
            if response.status_code != 201:
                response.failure(f"Falha no registro: {response.text}")

        # 2. Fazer Login
        response = self.client.post("/login", json={
            "email": email,
            "password": password
        })

        if response.status_code == 200:
            self.token = response.json().get("token")
        else:
            print(f"Erro ao logar: {response.text}")

    # ---------------------------------------------------------
    # TAREFAS (CENÁRIO 70/30)
    # ---------------------------------------------------------

    @task(7) # Peso 7 (70% de chance)
    def ler_dashboard(self):
        """
        Simula a leitura do Dashboard (GET).
        Cenário de alta frequência de leitura.
        """
        if not self.token: return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Agrupamos a requisição com nome "Dashboard" para o relatório ficar limpo
        self.client.get("/dashboard", headers=headers, name="Leitura Dashboard")

    @task(3) # Peso 3 (30% de chance)
    def criar_quiz(self):
        """
        Simula a criação de um Quiz (POST).
        Cenário de escrita no banco de dados.
        """
        if not self.token: return

        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Payload do Quiz
        payload = {
            "title": "Quiz de Carga Locust",
            "timePerQuestion": 30,
            "folderIds": [], 
            "questions": [
                {
                    "questionText": "Teste de carga é importante?",
                    "options": [
                        {"optionText": "Sim", "isCorrect": True},
                        {"optionText": "Com certeza", "isCorrect": False}
                    ]
                }
            ]
        }

        # Agrupamos com nome "Criar Quiz"
        self.client.post("/quizzes", json=payload, headers=headers, name="Escrita Criar Quiz")