const puppeteer = require('puppeteer');

const fastify = require('fastify')({ logger: true });

fastify.get('/screenshot', async (request, reply) => {
  let browser;
  try {
    const url = request.query.url;
    if (!url) {
      reply.code(400).send('Missing url query parameter');
      return;
    }

    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox',],
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForNetworkIdle();
    const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
    });

    reply.header('Content-Type', 'image/png').send(imageBuffer);

  } finally {
    await browser.close();
  }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();