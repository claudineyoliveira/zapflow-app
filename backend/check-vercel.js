const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if(msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
    }
  });

  console.log('Indo para https://zapflow-oficial.vercel.app ...');
  
  const response = await page.goto('https://zapflow-oficial.vercel.app', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('HTTP Status:', response.status());

  await new Promise(r => setTimeout(r, 4000));
  
  await page.screenshot({ path: 'vercel-screenshot.png', fullPage: true });
  console.log('Screenshot salva em vercel-screenshot.png');

  await browser.close();
})();
