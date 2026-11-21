// Screenshot helper for the local preview (run on a machine with Chrome; needs puppeteer-core).
// node shot.mjs URL out.png width height waitMs [fullPage]
import puppeteer from 'puppeteer-core'
const [url, out, w, h, wait, full] = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: +w, height: +h })
const bad = []
page.on('console', (m) => m.type() === 'error' && bad.push(m.text()))
page.on('pageerror', (e) => bad.push(String(e)))
page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1')) bad.push('EXTERNAL ' + r.url()) })
await page.goto(url, { waitUntil: 'load' })
await new Promise((r) => setTimeout(r, +wait))
await page.screenshot({ path: out, fullPage: full === '1' })
console.log('errors/external:', bad.length ? bad.slice(0, 5) : 'none')
await browser.close()
