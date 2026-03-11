const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://zapflow-oficial.vercel.app', { waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => document.body.innerText);
  const html = await page.evaluate(() => document.body.innerHTML);
  
  console.log('TEXT:', content.substring(0, 500));
  console.log('HTML SNIPPET:', html.substring(0, 500));
  
  await browser.close();
})();
