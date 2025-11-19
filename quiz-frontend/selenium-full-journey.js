// quiz-frontend/selenium-full-journey.js
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Função de pausa para aguardar animações de tela
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Gera dados aleatórios para sempre criar um usuário novo
const randomId = Math.floor(Math.random() * 100000);
const USER = {
  name: `AlunoE2E ${randomId}`,
  email: `aluno${randomId}@teste.com`,
  pass: '123456'
};

(async function runFullJourney() {
  // Configurações para limpar logs do Windows
  const options = new chrome.Options();
  options.excludeSwitches('enable-logging');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    console.log('🚀 --- INICIANDO JORNADA E2E BLINDADA ---');
    await driver.manage().window().maximize();

    // 1. ABRIR APP
    await driver.get('http://localhost:8081');
    console.log('✅ 1. App Aberto');

    // =========================================================
    // FASE 1: CADASTRO
    // =========================================================
    console.log('\n--- FASE 1: CADASTRO ---');
    
    const linkCadastro = await driver.wait(
      until.elementLocated(By.xpath("//div[contains(text(), 'Cadastre-se')]")), 
      10000
    );
    await sleep(1000); // Espera animação
    await linkCadastro.click();
    
    console.log('   Preenchendo formulário...');
    await driver.wait(until.elementLocated(By.css('[data-testid="reg-username"]')), 5000).sendKeys(USER.name);
    await driver.findElement(By.css('[data-testid="reg-email"]')).sendKeys(USER.email);
    await driver.findElement(By.css('[data-testid="reg-password"]')).sendKeys(USER.pass);
    
    const btnCadastrar = await driver.findElement(By.css('[data-testid="btn-submit-register"]'));
    await btnCadastrar.click();
    console.log('   Botão Cadastrar clicado.');

    // Lógica Híbrida (Alerta ou Redirecionamento)
    try {
        await driver.wait(until.alertIsPresent(), 3000);
        let alert = await driver.switchTo().alert();
        console.log(`   🔔 Alerta detectado: "${await alert.getText()}"`);
        await alert.accept();
    } catch (e) { 
        // Se não houver alerta, segue para verificar redirecionamento
    }

    // Verifica se foi para Login (procura o botão Entrar)
    try {
        await driver.wait(until.elementLocated(By.xpath("//div[text()='Entrar']")), 5000);
        console.log('✅ Cadastro finalizado. Redirecionado para Login.');
    } catch (e) {
        throw new Error("FALHA NO CADASTRO: Não redirecionou para Login.");
    }

    // =========================================================
    // FASE 2: LOGIN
    // =========================================================
    console.log('\n--- FASE 2: LOGIN ---');
    await sleep(1000); 
    
    await driver.wait(until.elementLocated(By.css('[data-testid="input-email"]')), 5000).sendKeys(USER.email);
    await driver.findElement(By.css('[data-testid="input-password"]')).sendKeys(USER.pass);
    
    // Clica em Entrar
    await driver.findElement(By.xpath("//div[text()='Entrar']")).click();

    await driver.wait(until.elementLocated(By.xpath("//div[text()='Meus Quizzes']")), 10000);
    console.log('✅ Login realizado. Dashboard carregado.');

    // =========================================================
    // FASE 3: CRIAR QUIZ
    // =========================================================
    console.log('\n--- FASE 3: CRIAR QUIZ ---');
    await sleep(1000); // Espera lista carregar

    await driver.findElement(By.xpath("//div[text()='Criar Novo Quiz']")).click();

    // [IMPORTANTE] Espera a animação de slide da tela terminar
    console.log('   Aguardando tela de criação carregar...');
    await sleep(2000); 

    // Título
    let inputTitle = await driver.wait(until.elementLocated(By.css('[data-testid="quiz-title"]')), 5000);
    await inputTitle.sendKeys(`Quiz Selenium ${randomId}`);
    
    // Pergunta
    await driver.findElement(By.css('input[placeholder="Texto da pergunta"]')).sendKeys("Teste automatizado?");
    
    // Opção 1
    await driver.findElement(By.css('input[placeholder="Alternativa 1"]')).sendKeys("Sim");
    
    // [CORREÇÃO CRÍTICA] Marcar a opção correta (Switch)
    // Usamos executeScript para clicar direto no checkbox, ignorando estilos visuais
    console.log('   Marcando alternativa correta...');
    let switches = await driver.findElements(By.css('input[type="checkbox"]')); 
    if (switches.length > 0) {
         // Pega o último switch (assumindo ser o da opção que estamos criando)
         let targetSwitch = switches[switches.length - 1];
         await driver.executeScript("arguments[0].click();", targetSwitch);
    }

    // Opção 2
    await driver.findElement(By.css('input[placeholder="Alternativa 2"]')).sendKeys("Não");

    // Salvar
    console.log('   Salvando...');
    await driver.findElement(By.xpath("//div[text()='Salvar Quiz']")).click();

    // Lida com possível Alerta de Sucesso
    try {
        await driver.wait(until.alertIsPresent(), 5000);
        let alert = await driver.switchTo().alert();
        await alert.accept();
    } catch (e) { }
    
    // Espera voltar ao Dashboard
    await driver.wait(until.elementLocated(By.xpath("//div[text()='Meus Quizzes']")), 5000);
    console.log('✅ Quiz Criado.');

    // =========================================================
    // FASE 4: JOGAR
    // =========================================================
    console.log('\n--- FASE 4: JOGAR ---');
    await sleep(2000); // Espera lista atualizar

    let playButtons = await driver.findElements(By.xpath("//div[text()='Jogar']"));
    if (playButtons.length > 0) {
        let lastButton = playButtons[playButtons.length - 1];
        
        // [IMPORTANTE] Scroll até o botão para garantir que ele está visível
        await driver.executeScript("arguments[0].scrollIntoView(true);", lastButton);
        await sleep(500);
        await lastButton.click();
    } else {
        throw new Error("Nenhum botão Jogar encontrado!");
    }

    console.log('   Quiz iniciado.');
    await sleep(2000); // Espera animação de entrada
    
    // Responder "Sim"
    try {
        // Tenta pelo testID
        let option = await driver.wait(until.elementLocated(By.css('[data-testid="option-0"]')), 3000);
        await option.click();
    } catch (e) {
        // Tenta pelo texto
        let option = await driver.wait(until.elementLocated(By.xpath("//div[text()='Sim']")), 3000);
        await option.click();
    }

    // Confirmar
    await driver.findElement(By.xpath("//div[text()='Confirmar Resposta']")).click();
    await sleep(1000);

    // Espera tela de Resultados
    await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Quiz Finalizado!')]")), 10000);
    console.log('✅ Jogo finalizado. Tela de resultados carregada.');

    // =========================================================
    // FASE 5: VOLTAR
    // =========================================================
    console.log('\n--- FASE 5: VOLTAR ---');
    
    await driver.findElement(By.xpath("//div[text()='Voltar ao Dashboard']")).click();
    
    await driver.wait(until.elementLocated(By.xpath("//div[text()='Meus Quizzes']")), 5000);
    console.log('🎉 TESTE E2E CONCLUÍDO COM SUCESSO! 🎉');

  } catch (error) {
    console.error('\n❌ FALHA NO TESTE:', error.message);
  } finally {
    await driver.quit();
  }
})();