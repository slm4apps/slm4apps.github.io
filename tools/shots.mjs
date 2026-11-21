// Screenshots of the local preview: hero + 2 scroll positions at 1440x900 and 390x844.
// node shots.mjs BASE_URL OUT_DIR   (needs puppeteer-core and Chrome; run on a second machine)
import puppeteer from 'puppeteer-core'
const [url, out] = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
const bad = []
for (const [name, w, h] of [['1440', 1440, 900], ['390', 390, 844]]) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  page.on('console', (m) => m.type() === 'error' && bad.push(m.text()))
  page.on('pageerror', (e) => bad.push(String(e)))
  page.on('request', (r) => { if (!r.url().startsWith(url) && !r.url().startsWith('data:')) bad.push('EXTERNAL ' + r.url()) })
  await page.goto(url, { waitUntil: 'load' })
  await page.mouse.move(w * 0.7, h * 0.45)
  await new Promise((r) => setTimeout(r, 5000))
  await page.screenshot({ path: `${out}/hero-${name}.png` })
  for (const [i, sel] of [['a', '#calls'], ['b', '#family']]) {
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant' }), sel)
    await new Promise((r) => setTimeout(r, 4500))
    await page.screenshot({ path: `${out}/scroll-${i}-${name}.png` })
  }
  await page.close()
}
console.log('errors/external:', bad.length ? bad.slice(0, 6) : 'none')
await browser.close()
