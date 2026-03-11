const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  console.log('Indo para localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log('Goto erro:', e.message));

  await new Promise(r => setTimeout(r, 4000));

  const errorText = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal) return null;
    const root = portal.shadowRoot;
    if (!root) return null;
    
    // Pega o erro
    const heading = root.querySelector('[data-nextjs-dialog-header]') || root.querySelector('h1, h2');
    const content = root.querySelector('[data-nextjs-dialog-body]') || root.querySelector('p');
    return {
      title: heading ? heading.innerText : 'Sem título',
      desc: content ? content.innerText : 'Sem desc'
    };
  });

  console.log('ERRO DO NEXT:', errorText);

  await browser.close();
})();
