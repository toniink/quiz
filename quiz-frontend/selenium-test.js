const { Builder, By, until, error } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function runE2ETest() {
  // Configurações para diminuir o ruído de logs USB no Windows (opcional, mas ajuda a limpar o console)
  const options = new chrome.Options();
  options.excludeSwitches('enable-logging'); 

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    console.log('🔵 --- Iniciando Teste E2E com Selenium ---');

    // 1. Abrir o App
    await driver.get('http://localhost:8081'); 
    console.log('✅ 1. App Aberto');

    // 2. Preencher E-mail
    const emailInput = await driver.wait(
      until.elementLocated(By.css('[data-testid="input-email"]')), 
      5000
    );
    await emailInput.sendKeys('picapau@email.com');
    console.log('✅ 2. E-mail preenchido');

    // 3. Preencher Senha (PROPOSITADAMENTE ERRADA PARA TESTE)
    // Mude para '123456' para testar o sucesso
    const senhaTeste = 'pipoca123'; 
    
    const passInput = await driver.findElement(By.css('[data-testid="input-password"]'));
    await passInput.sendKeys(senhaTeste); 
    console.log(`✅ 3. Senha preenchida: "${senhaTeste}"`);

    // 4. Clicar em Entrar
    const loginBtn = await driver.findElement(By.xpath("//div[text()='Entrar']"));
    await loginBtn.click();
    console.log('✅ 4. Botão Entrar clicado. Aguardando resposta...');

    // --- LÓGICA DE DECISÃO (Sucesso ou Falha) ---
    
    try {
      // Tenta esperar pelo Dashboard por 3 segundos
      await driver.wait(
        until.elementLocated(By.xpath("//div[text()='Meus Quizzes']")), 
        3000
      );
      console.log('🎉 5. SUCESSO: Login realizado e Dashboard carregado!');

    } catch (e) {
      // Se o Dashboard não apareceu em 3 segundos, verifica se apareceu um ALERTA de erro
      if (e instanceof error.TimeoutError) {
        console.log('⚠️  Dashboard não carregou. Verificando se há mensagem de erro...');
        
        try {
          // Espera por um alerta nativo do navegador (window.alert)
          await driver.wait(until.alertIsPresent(), 2000);
          
          // Pega o controle do alerta
          let alert = await driver.switchTo().alert();
          let alertText = await alert.getText();
          
          console.log(`🛑 5. FALHA NO LOGIN DETECTADA (Esperado):`);
          console.log(`   Mensagem do Sistema: "${alertText}"`);
          
          // Aceita o alerta para fechar a janelinha
          await alert.accept();

        } catch (alertError) {
          // Se não tem Dashboard E não tem Alerta, aí sim é um erro crítico
          console.error('❌ ERRO CRÍTICO: O sistema não carregou o dashboard nem exibiu mensagem de erro.');
          throw alertError; // Relança o erro para finalizar
        }
      } else {
        throw e; // Se foi outro tipo de erro, relança
      }
    }

  } catch (error) {
    console.error('\n💥 OCORREU UM ERRO NA EXECUÇÃO DO TESTE:');
    console.error(error.message);
  } finally {
    // Fecha o navegador após uma pequena pausa para você ver o resultado
    await driver.sleep(2000); 
    await driver.quit();
    console.log('🔵 --- Teste Finalizado ---');
  }
})();