const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if(msg.type() === 'error') {
      console.log('BROWSER ERROR CONSOLE:', msg.text());
    }
  });

  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  console.log('Indo para localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log('Goto erro:', e.message));

  // Wait 4 seconds for the hydration and the next.js overlay to appear
  await new Promise(r => setTimeout(r, 4000));

  // Get next.js error overlay text
  const overlayText = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal) return null;
    return portal.shadowRoot ? portal.shadowRoot.textContent : portal.textContent;
  });

  console.log('Next.js Overlay Text:', overlayText);

  await browser.close();
})();
