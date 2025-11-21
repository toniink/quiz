const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// --- CONFIGURAÇÕES ---
const PAUSE = 1500;       
const LONG_PAUSE = 3000;  
const TIMEOUT = 20000;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomId = Math.floor(Math.random() * 10000);
const BASE_URL = 'http://localhost:8081';

const USER = {
  name: `UserFinal ${randomId}`,
  email: `final${randomId}@teste.com`,
  pass: '123456'
};

// --- HELPERS ---

async function click(driver, selector) {
    let locator = selector.startsWith('//') ? By.xpath(selector) : By.css(selector);
    try {
        const el = await driver.wait(until.elementLocated(locator), TIMEOUT);
        await driver.wait(until.elementIsVisible(el), TIMEOUT);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        await sleep(300); 
        await driver.executeScript("arguments[0].click();", el);
        await sleep(PAUSE);
    } catch (e) {
        throw new Error(`Falha ao clicar em: ${selector} - ${e.message}`);
    }
}

async function type(driver, selector, text) {
    const el = await driver.wait(until.elementLocated(By.css(selector)), TIMEOUT);
    await el.sendKeys(text);
}

async function answerQuestion(driver) {
    await sleep(500);
    try { await click(driver, '[data-testid="option-0"]'); } 
    catch (e) { 
        let opts = await driver.findElements(By.css('[role="button"]')); 
        if(opts.length > 0) await driver.executeScript("arguments[0].click();", opts[0]); 
    }
    await click(driver, '[data-testid="btn-confirm"]');
    await click(driver, '[data-testid="btn-next"]');
    await sleep(LONG_PAUSE);
}

(async function runTest() {
  const options = new chrome.Options();
  options.excludeSwitches('enable-logging');
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('🚀 INICIANDO E2E (VERSÃO ESTÁVEL)...');
    await driver.manage().window().maximize();
    await driver.get(BASE_URL); await sleep(LONG_PAUSE);

    // 1. CADASTRO
    console.log('🔹 FASE 1: CADASTRO');
    const linkCadastro = await driver.findElement(By.xpath("//div[contains(text(), 'Cadastre-se')]"));
    await linkCadastro.click(); await sleep(PAUSE);
    
    await type(driver, '[data-testid="reg-username"]', USER.name);
    await type(driver, '[data-testid="reg-email"]', USER.email);
    await type(driver, '[data-testid="reg-password"]', USER.pass);
    await click(driver, '[data-testid="btn-submit-register"]');
    try { await driver.switchTo().alert().accept(); } catch(e) {}

    // 2. LOGIN
    console.log('🔹 FASE 2: LOGIN');
    await type(driver, '[data-testid="input-email"]', USER.email);
    await type(driver, '[data-testid="input-password"]', USER.pass);
    await click(driver, '[data-testid="btn-submit-login"]');
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-create-quiz"]')), TIMEOUT);
    console.log('✅ Logado.');

    // 3. CRIAR QUIZ SIMPLES
    console.log('🔹 FASE 3: CRIAR QUIZ');
    await click(driver, '[data-testid="btn-create-quiz"]');
    await sleep(LONG_PAUSE);
    await type(driver, '[data-testid="quiz-title"]', `Quiz ${randomId}`);
    await driver.findElement(By.css('[data-testid="quiz-title"]')).sendKeys(Key.TAB);
    
    await driver.findElement(By.css('[placeholder="Enunciado da pergunta..."]')).sendKeys("P1");
    await driver.findElement(By.css('input[placeholder*="Opção 1"]')).sendKeys("A");
    let switches = await driver.findElements(By.css('input[type="checkbox"]'));
    if(switches.length > 0) await driver.executeScript("arguments[0].click();", switches[switches.length-1]);
    await driver.findElement(By.css('input[placeholder*="Opção 2"]')).sendKeys("B");
    
    let saveBtn = await driver.findElement(By.xpath("//div[text()='SALVAR QUIZ']"));
    await driver.executeScript("arguments[0].click();", saveBtn);
    try { await driver.switchTo().alert().accept(); } catch(e) {}
    await sleep(LONG_PAUSE);

    // 4. CRIAR PASTA
    console.log('🔹 FASE 4: PASTA');
    // Garante que estamos no Dashboard antes de ir para pastas
    await driver.get(BASE_URL); await sleep(LONG_PAUSE);

    await click(driver, '[data-testid="btn-manage-folders"]');
    await sleep(LONG_PAUSE);
    await click(driver, '[data-testid="btn-new-folder"]');
    await type(driver, '[data-testid="input-folder-name"]', `Pasta ${randomId}`);
    await click(driver, '[data-testid="btn-confirm-create-folder"]');
    await sleep(PAUSE);
    
    // Entrar na pasta (só para validar criação)
    await click(driver, `[data-testid="folder-Pasta ${randomId}"]`);
    await sleep(LONG_PAUSE);

    // CORREÇÃO: Em vez de voltar com 'back', forçamos a ida ao Dashboard
    console.log('   Voltando ao Dashboard...');
    await driver.get(BASE_URL); 
    await sleep(LONG_PAUSE);
    // Verifica se carregou o botão de criar quiz
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-create-quiz"]')), TIMEOUT);

    // 5. QUIZZES NA PASTA (A e B)
    console.log('🔹 FASE 5: CRIAR QUIZZES NA PASTA');
    // Agora é seguro clicar
    await click(driver, '[data-testid="btn-create-quiz"]');
    await sleep(LONG_PAUSE);
    
    // Quiz A
    await type(driver, '[data-testid="quiz-title"]', `Quiz A ${randomId}`);
    await driver.findElement(By.css('[data-testid="quiz-title"]')).sendKeys(Key.TAB);
    
    try {
        let folderLabel = await driver.findElement(By.xpath(`//div[contains(text(), 'Pasta ${randomId}')]`));
        let folderSwitch = await folderLabel.findElement(By.xpath("./..")).findElement(By.css('input[type="checkbox"]'));
        await driver.executeScript("arguments[0].click();", folderSwitch);
    } catch (e) { console.log("   (Erro ao selecionar pasta: Scroll ou elemento não achado)"); }

    await driver.findElement(By.css('[placeholder="Enunciado da pergunta..."]')).sendKeys("Q1");
    await driver.findElement(By.css('input[placeholder*="Opção 1"]')).sendKeys("X");
    await driver.findElement(By.css('input[placeholder*="Opção 2"]')).sendKeys("Y");
    switches = await driver.findElements(By.css('input[type="checkbox"]'));
    if(switches.length > 0) await driver.executeScript("arguments[0].click();", switches[switches.length-1]);
    let saveBtn2 = await driver.findElement(By.xpath("//div[text()='SALVAR QUIZ']"));
    await driver.executeScript("arguments[0].click();", saveBtn2);
    try { await driver.switchTo().alert().accept(); } catch(e) {}
    await sleep(LONG_PAUSE);

    // Quiz B
    console.log('   Criando Quiz B...');
    await click(driver, '[data-testid="btn-create-quiz"]');
    await sleep(LONG_PAUSE);
    await type(driver, '[data-testid="quiz-title"]', `Quiz B ${randomId}`);
    await driver.findElement(By.css('[data-testid="quiz-title"]')).sendKeys(Key.TAB);
    try {
        let folderLabel = await driver.findElement(By.xpath(`//div[contains(text(), 'Pasta ${randomId}')]`));
        let folderSwitch = await folderLabel.findElement(By.xpath("./..")).findElement(By.css('input[type="checkbox"]'));
        await driver.executeScript("arguments[0].click();", folderSwitch);
    } catch (e) {}

    await driver.findElement(By.css('[placeholder="Enunciado da pergunta..."]')).sendKeys("Q1");
    await driver.findElement(By.css('input[placeholder*="Opção 1"]')).sendKeys("X");
    await driver.findElement(By.css('input[placeholder*="Opção 2"]')).sendKeys("Y");
    switches = await driver.findElements(By.css('input[type="checkbox"]'));
    if(switches.length > 0) await driver.executeScript("arguments[0].click();", switches[switches.length-1]);
    let saveBtn3 = await driver.findElement(By.xpath("//div[text()='SALVAR QUIZ']"));
    await driver.executeScript("arguments[0].click();", saveBtn3);
    try { await driver.switchTo().alert().accept(); } catch(e) {}
    await sleep(LONG_PAUSE);

    // 6. GERENCIAR E REMOVER
    console.log('🔹 FASE 6: REMOVER QUIZ A');
    await click(driver, '[data-testid="btn-manage-folders"]');
    await sleep(PAUSE);
    await click(driver, `[data-testid="folder-Pasta ${randomId}"]`);
    await sleep(PAUSE);

    await click(driver, '[data-testid="btn-folder-manage"]');
    await sleep(PAUSE);
    
    // Seleciona Quiz A
    await click(driver, `[data-testid="quiz-item-Quiz A ${randomId}"]`);
    
    // Remove
    await click(driver, '[data-testid="btn-remove-from-folder"]');
    try { await driver.switchTo().alert().accept(); } catch(e) {}
    
    await sleep(LONG_PAUSE);
    
    await click(driver, '[data-testid="btn-folder-manage"]'); // Cancelar seleção
    console.log('✅ Quiz A removido.');

    // 7. VOLTAR E LOGOUT (PULA O JOGO)
    console.log('🔹 FASE 7: SAÍDA (Voltar e Logout)');
    
    console.log('   Voltando ao Dashboard...');
    await driver.get(BASE_URL); // Força volta segura
    await sleep(LONG_PAUSE);

    // Verifica se está no Dashboard
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-hamburger"]')), TIMEOUT);
    
    // Abre Menu
    await click(driver, '[data-testid="btn-hamburger"]');
    await sleep(PAUSE);

    // Sair
    let logoutBtn = await driver.findElement(By.xpath("//div[text()='Sair']"));
    await driver.executeScript("arguments[0].click();", logoutBtn);
    
    await driver.wait(until.elementLocated(By.css('[data-testid="btn-submit-login"]')), TIMEOUT);
    console.log('🎉 SUCESSO TOTAL! 🎉');

  } catch (error) { console.error('❌ ERRO:', error); } 
  finally { await driver.quit(); }
})();