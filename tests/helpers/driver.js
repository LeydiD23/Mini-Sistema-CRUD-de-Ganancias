const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config');

async function crearDriver() {
  const options = new chrome.Options();
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--window-size=1280,900');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  return driver;
}

module.exports = { crearDriver };
