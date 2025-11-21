const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// --- CONFIGURAÇÕES ---
const PAUSE = 1000;       
const LONG_PAUSE = 2500;  
const TIMEOUT = 20000; // 20 segundos de tolerância

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomId = Math.floor(Math.random() * 10000);
const BASE_URL = 'http://localhost:8081';

const USER = {
  name: `UserFinal ${randomId}`,
  email: `final${randomId}@teste.com`,
  pass: '123456'
};

// --- HELPERS ---

// Clica num elemento (Suporta CSS Selector e XPath)
async function click(driver, selector) {
    let locator = selector.startsWith('//') || selector.startsWith('(') ? By.xpath(selector) : By.css(selector);
    try {
        const el = await driver.wait(until.elementLocated(locator), TIMEOUT);
        await driver.wait(until.elementIsVisible(el), TIMEOUT);
        // Scroll para garantir visibilidade
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        await sleep(300); 
        await driver.executeScript("arguments[0].click();", el);
        await sleep(PAUSE);
    } catch (e) {
        throw new Error(`Falha ao clicar em: ${selector} - ${e.message}`);
    }
}

// Digita num campo
async function type(driver, cssSelector, text) {
    const el = await driver.wait(until.elementLocated(By.css(cssSelector)), TIMEOUT);
    await el.sendKeys(text);
}

// Helper Robusto para Responder Pergunta (Usando IDs)
async function answerQuestion(driver) {
    console.log('      -> A responder...');
    await sleep(500);

    // 1. Clica na primeira opção disponível
    // Tenta pelo ID option-0, se não der, tenta genericamente
    try {
        let options = await driver.findElements(By.css('[data-testid="option-0"]'));
        if (options.length > 0) {
             await driver.executeScript("arguments[0].click();", options[0]);
        } else {
             // Fallback
             let allBtns = await driver.findElements(By.css('[role="button"]'));
             if(allBtns.length > 0) await driver.executeScript("arguments[0].click();", allBtns[0]);
        }
    } catch (e) { console.log("      (Aviso: Erro ao clicar na opção)"); }

    await sleep(500);

    // 2. Clica em Confirmar (ID btn-confirm)
    await click(driver, '[data-testid="btn-confirm"]');
    
    // 3. Clica em Avançar (ID btn-next)
    // Serve para "Próxima", "Próximo Quiz" e "Ver Resultados"
    await click(driver, '[data-testid="btn-next"]');
    
    await sleep(LONG_PAUSE);
}

(async function runComplexTest() {
  const options = new chrome.Options();
  options.excludeSwitches('enable-logging');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    console.log('🚀 --- INICIANDO CENÁRIO FINAL BLINDADO ---');
    await driver.manage().window().maximize();

    // =================================================================
    // 1. CADASTRO E LOGIN
    // =================================================================
    console.log('\n🔹 FASE 1: CADASTRO E LOGIN');
    await driver.get(BASE_URL);
    await sleep(LONG_PAUSE);

    // Cadastro
    await click(driver, "//div[contains(text(), 'Cadastre-se')]");
    
    await type(driver, '[data-testid="reg-username"]', USER.name);
    await type(driver, '[data-testid="reg-email"]', USER.email);
    await type(driver, '[data-testid="reg-password"]', USER.pass);
    
    await click(driver, '[data-testid="btn-submit-register"]');
    
    try {
        await driver.wait(until.alertIsPresent(), 3000);
        await (await driver.switchTo().alert()).accept();
    } catch (e) {}

    // Login
    await type(driver, '[data-testid="input-email"]', USER.email);
    await type(driver, '[data-testid="input-password"]', USER.pass);
    await click(driver, '[data-testid="btn-submit-login"]');

    // Espera Dashboard (procura o botão de criar quiz que tem ID)
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-create-quiz"]')), TIMEOUT);
    console.log('✅ Logado.');

    // =================================================================
    // 2. CRIAR QUIZ SIMPLES E JOGAR
    // =================================================================
    console.log('\n🔹 FASE 2: QUIZ SOLO');
    
    await click(driver, '[data-testid="btn-create-quiz"]');
    await sleep(LONG_PAUSE);

    await type(driver, '[data-testid="quiz-title"]', `Quiz Solo ${randomId}`);
    await driver.findElement(By.css('[data-testid="quiz-title"]')).sendKeys(Key.TAB);
    
    // Preenche Pergunta (Input genérico ou textarea)
    let qInput = await driver.findElement(By.css('[placeholder="Enunciado da pergunta..."]'));
    await qInput.sendKeys("P1");
    
    await driver.findElement(By.css('input[placeholder*="Opção 1"]')).sendKeys("A");
    
    // Marca Switch
    let switches = await driver.findElements(By.css('input[type="checkbox"]'));
    if (switches.length > 0) await driver.executeScript("arguments[0].click();", switches[switches.length - 1]);

    await driver.findElement(By.css('input[placeholder*="Opção 2"]')).sendKeys("B");
    
    // Salvar (Botão pelo texto pois não pusemos ID nele no último update, mas podemos achar pelo texto)
    let saveBtn = await driver.findElement(By.xpath("//div[text()='SALVAR QUIZ']"));
    await driver.executeScript("arguments[0].scrollIntoView(true);", saveBtn);
    await driver.executeScript("arguments[0].click();", saveBtn);
    
    try { 
        await driver.wait(until.alertIsPresent(), 5000);
        await (await driver.switchTo().alert()).accept(); 
    } catch (e) {}
    await sleep(LONG_PAUSE);

    // Jogar
    console.log('   A jogar Quiz Solo...');
    await driver.get(BASE_URL); 
    await sleep(LONG_PAUSE);

    let playBtns = await driver.findElements(By.xpath("//div[text()='Jogar']"));
    let lastPlay = playBtns[playBtns.length - 1];
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", lastPlay);
    await driver.executeScript("arguments[0].click();", lastPlay);
    
    await sleep(LONG_PAUSE);
    
    // Responde usando helper
    await answerQuestion(driver);

    // Espera resultados e volta
    await driver.wait(until.elementLocated(By.css('[data-testid="text-quiz-finished"]')), TIMEOUT);
    await click(driver, '[data-testid="btn-back-dashboard"]');
    
    console.log('✅ Quiz Solo finalizado.');
    await sleep(LONG_PAUSE);

    // =================================================================
    // 3. CRIAR PASTA
    // =================================================================
    console.log('\n🔹 FASE 3: CRIAR PASTA');
    
    await click(driver, '[data-testid="btn-manage-folders"]');
    await sleep(LONG_PAUSE);

    await click(driver, '[data-testid="btn-new-folder"]');
    
    await type(driver, '[data-testid="input-folder-name"]', `Pasta E2E ${randomId}`);
    await click(driver, '[data-testid="btn-confirm-create-folder"]');
    await sleep(PAUSE); 

    console.log('   A voltar ao Dashboard...');
    await driver.navigate().back();
    await sleep(LONG_PAUSE);
    console.log('✅ Pasta criada.');

    // =================================================================
    // 4. CRIAR 2 QUIZZES NA PASTA
    // =================================================================
    console.log('\n🔹 FASE 4: CRIAR QUIZZES NA PASTA');
    await driver.get(BASE_URL);
    await sleep(LONG_PAUSE);

    async function createComplexQuiz(title) {
        console.log(`   A criar ${title}...`);
        await click(driver, '[data-testid="btn-create-quiz"]');
        await sleep(LONG_PAUSE);

        await type(driver, '[data-testid="quiz-title"]', title);

        // Selecionar Pasta
        try {
            let folderLabel = await driver.findElement(By.xpath(`//div[contains(text(), 'Pasta E2E ${randomId}')]`));
            let folderRow = await folderLabel.findElement(By.xpath("./..")); 
            let folderSwitch = await folderRow.findElement(By.css('input[type="checkbox"]'));
            await driver.executeScript("arguments[0].click();", folderSwitch);
        } catch (e) { console.log("   (Aviso: Pasta não selecionada)"); }

        // P1
        await driver.findElement(By.css('[placeholder="Enunciado da pergunta..."]')).sendKeys("P1");
        await driver.findElement(By.css('input[placeholder*="Opção 1"]')).sendKeys("A");
        await driver.findElement(By.css('input[placeholder*="Opção 2"]')).sendKeys("B");
        
        // Add Alt
        let addAltBtn = await driver.findElement(By.xpath("//div[text()='+ Adicionar Alternativa']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", addAltBtn);
        await addAltBtn.click();
        
        let inputs = await driver.findElements(By.css('input[placeholder*="Opção"]'));
        await inputs[inputs.length - 1].sendKeys("C");

        // Switch P1
        let allSwitches = await driver.findElements(By.css('input[type="checkbox"]'));
        if (allSwitches.length > 0) await driver.executeScript("arguments[0].click();", allSwitches[allSwitches.length - 1]);

        // P2
        let addQBtn = await driver.findElement(By.xpath("//div[text()='+ NOVA PERGUNTA']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", addQBtn);
        await addQBtn.click();
        await sleep(500);
        
        let qInputs = await driver.findElements(By.css('[placeholder="Enunciado da pergunta..."]'));
        await qInputs[qInputs.length - 1].sendKeys("P2");

        let oInputs = await driver.findElements(By.css('input[placeholder*="Opção"]'));
        await oInputs[oInputs.length - 2].sendKeys("Y");
        await oInputs[oInputs.length - 1].sendKeys("Z");
        
        // Switch P2
        allSwitches = await driver.findElements(By.css('input[type="checkbox"]'));
        await driver.executeScript("arguments[0].click();", allSwitches[allSwitches.length - 1]);
        
        // Salvar
        let saveBtn = await driver.findElement(By.xpath("//div[text()='SALVAR QUIZ']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", saveBtn);
        await saveBtn.click();

        try { 
            await driver.wait(until.alertIsPresent(), 5000);
            await (await driver.switchTo().alert()).accept(); 
        } catch (e) {}
        await sleep(LONG_PAUSE);
    }

    await createComplexQuiz(`Quiz A ${randomId}`);
    await createComplexQuiz(`Quiz B ${randomId}`);
    
    console.log('✅ 2 Quizzes criados.');

    // =================================================================
    // 5. JOGAR PLAYLIST
    // =================================================================
    console.log('\n🔹 FASE 5: JOGAR PASTA');
    
    await click(driver, '[data-testid="btn-manage-folders"]');
    await sleep(LONG_PAUSE);
    
    // Clica na pasta criada
    await click(driver, `[data-testid="folder-Pasta E2E ${randomId}"]`);
    await sleep(LONG_PAUSE);

    // Clica em Jogar Todos
    await click(driver, '[data-testid="btn-play-all"]');
    await sleep(LONG_PAUSE);

    // 4 Perguntas (A-P1, A-P2, B-P1, B-P2)
    for (let i = 0; i < 4; i++) {
        await answerQuestion(driver);
    }
    
    await driver.wait(until.elementLocated(By.css('[data-testid="text-quiz-finished"]')), TIMEOUT);
    console.log('✅ Playlist finalizada.');

    await click(driver, '[data-testid="btn-back-dashboard"]');
    await sleep(LONG_PAUSE);

    // =================================================================
    // 6. REMOVER QUIZ A
    // =================================================================
    console.log('\n🔹 FASE 6: REMOVER QUIZ');
    
    await click(driver, '[data-testid="btn-manage-folders"]');
    await sleep(PAUSE);
    await click(driver, `[data-testid="folder-Pasta E2E ${randomId}"]`);
    await sleep(PAUSE);

    // Botão Gerenciar
    await click(driver, '[data-testid="btn-folder-manage"]');
    await sleep(PAUSE);

    // Seleciona Quiz A (Pelo ID dinâmico do card)
    // Como não sabemos o ID exato do banco, usamos o seletor de texto ou o ID que colocamos 'quiz-item-TITULO'
    await click(driver, `[data-testid="quiz-item-Quiz A ${randomId}"]`);
    
    // Botão Remover
    await click(driver, '[data-testid="btn-remove-from-folder"]');
    
    try { await driver.switchTo().alert().accept(); } catch(e) {}
    
    await sleep(LONG_PAUSE);
    
    // Cancelar gestão
    await click(driver, '[data-testid="btn-folder-manage"]');
    
    console.log('✅ Quiz A removido.');

    // =================================================================
    // 7. JOGAR QUIZ B (RESTANTE)
    // =================================================================
    console.log('\n🔹 FASE 7: JOGAR RESTANTE');
    
    // Procura o botão jogar dentro do card do Quiz B
    // XPath: Procura elemento com testID do Quiz B -> desce para achar botão com texto 'Jogar'
    // Como o botão de jogar não tem ID específico por quiz, usamos hierarquia
    let quizBCard = await driver.findElement(By.css(`[data-testid="quiz-item-Quiz B ${randomId}"]`));
    let playB = await quizBCard.findElement(By.xpath(".//div[text()='Jogar']"));
    await driver.executeScript("arguments[0].click();", playB);
    await sleep(LONG_PAUSE);
    
    // 2 perguntas
    await answerQuestion(driver);
    await answerQuestion(driver);

    await driver.wait(until.elementLocated(By.css('[data-testid="text-quiz-finished"]')), TIMEOUT);
    await click(driver, '[data-testid="btn-back-dashboard"]');
    await sleep(LONG_PAUSE);

    // =================================================================
    // 8. LOGOUT
    // =================================================================
    console.log('\n🔹 FASE 8: LOGOUT');
    
    // Menu Hamburguer
    // Como o menu está numa TopBar custom, usamos o XPath do ícone ou classe
    // Se adicionou testID="btn-hamburger" na DashboardScreen:
    try {
        await click(driver, '[data-testid="btn-hamburger"]');
    } catch (e) {
        // Fallback texto
        await click(driver, "//div[text()='☰']");
    }
    
    await sleep(PAUSE);
    
    // Clica Sair
    let logoutBtn = await driver.findElement(By.xpath("//div[text()='Sair']"));
    await driver.executeScript("arguments[0].click();", logoutBtn);
    
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-submit-login"]')), TIMEOUT);
    
    console.log('🎉🎉🎉 CENÁRIO COMPLEXO CONCLUÍDO COM SUCESSO! 🎉🎉🎉');

  } catch (error) {
    console.error('\n❌ FALHA CRÍTICA NO TESTE:', error);
  } finally {
    await driver.quit();
  }
})();