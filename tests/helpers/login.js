const { By, until } = require('selenium-webdriver');
const config = require('../config');

async function limpiarAlmacenamiento(driver) {
  await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
}

async function abrirApp(driver) {
  await driver.get(config.baseUrl);
  await limpiarAlmacenamiento(driver);
  await driver.get(config.baseUrl);
  await driver.wait(until.elementLocated(By.id('login-usuario')), config.timeoutElem);
}

async function login(driver, usuario, contrasena) {
  await abrirApp(driver);
  await completarLogin(driver, usuario || config.usuario, contrasena || config.contrasena);
  await driver.wait(until.elementLocated(By.id('app-view')), config.timeoutElem);
}

async function intentarLogin(driver, usuario, contrasena) {
  await abrirApp(driver);
  await completarLogin(driver, usuario, contrasena);
}

async function completarLogin(driver, usuario, contrasena) {
  const campoUsuario = await driver.findElement(By.id('login-usuario'));
  await campoUsuario.clear();
  await campoUsuario.sendKeys(usuario);

  const campoPass = await driver.findElement(By.id('login-contrasena'));
  await campoPass.clear();
  await campoPass.sendKeys(contrasena);

  await driver.findElement(By.id('login-btn')).click();
}

module.exports = { login, intentarLogin, limpiarAlmacenamiento, abrirApp };
