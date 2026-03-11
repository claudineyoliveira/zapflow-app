const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Captura erros no console
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Indo para localhost:3000...');
  const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log('Goto error:', e.message));

  if (response) {
    console.log('Status code:', response.status());
    console.log('Destino final da URL:', page.url());
  }

  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot salva em screenshot.png');
  
  await browser.close();
})();
