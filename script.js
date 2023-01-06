import { chromium } from 'k6/x/browser'
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.0/index.js';
import http from 'k6/http'

export const options = {
  scenarios: {
    browser: {
      exec: 'browser',
      executor: 'constant-vus',
      vus: 1,
      duration: '5s'
    },
    protocol: {
      exec: 'protocol',
      executor: 'constant-vus',
      vus: 10,
      duration: '10s'
    }
  }
}

export function browser() {
  const browser = chromium.launch({ headless: false })
  const page = browser.newPage()

  page
    .goto('https://test.k6.io/my_messages.php', { waitUntil: 'networkidle' })
    .then(() => {
      page.locator('input[name="login"]').type('admin')
      page.locator('input[name="password"]').type('123')

      page.screenshot({ path: 'screenshot.png'})

      return Promise.all([
        page.waitForNavigation(),
        page.locator('input[type="submit"]').click()
      ]).then(() => {
        // check(page, {
        //   'header name': page.locator('h2').textContent() == 'Welcome, admin!'
        // })
        expect(page.locator('h2').textContent()).to.equal('Welcome, admin!')
      })
    })
    .finally(() => {
      page.close()
      browser.close()
    })
}

export function protocol() {
  const res = http.get('https://test.k6.io/my_messages.php')

  expect(res.status).to.equal(200)
}