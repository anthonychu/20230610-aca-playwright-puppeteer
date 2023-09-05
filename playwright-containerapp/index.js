const fastify = require('fastify')({ logger: true })
const playwright = require('playwright')

fastify.get('/screenshot', async (request, reply) => {
  let browser, context
  try {
    const url = request.query.url
    if (!url) {
      reply.code(400).send('Missing url query parameter')
      return
    }

    const browserType = request.query.browser || 'chromium'
    if (!['chromium', 'firefox', 'webkit'].includes(browserType)) {
      reply.code(400).send('Invalid browser type')
      return
    }

    browser = await playwright[browserType].launch()
    context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    })
    reply.header('Content-Type', 'image/png').send(imageBuffer)
  } finally {
    if (context) await context.close()
    if (browser) await browser.close()
  }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()