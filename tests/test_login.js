const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const config = require('./config');
const { crearDriver } = require('./helpers/driver');
const { login, intentarLogin } = require('./helpers/login');
const { capturar, nombreSeguro } = require('./helpers/screenshots');

describe('Inicio de sesión (US-01, US-02)', function () {
  this.timeout(120000);
  let driver;

  beforeEach(async function () {
    driver = await crearDriver();
  });

  afterEach(async function () {
    if (driver) {
      await capturar(driver, nombreSeguro(this.currentTest.title), this);
      await driver.quit();
    }
  });

  it('US-01 [camino feliz]: login con credenciales válidas muestra la aplicación', async function () {
    await login(driver);

    const appVisible = await driver.findElement(By.id('app-view')).isDisplayed();
    assert.strictEqual(appVisible, true, 'La vista de la aplicación debería mostrarse');

    const bienvenida = await driver.findElement(By.id('bienvenida')).getText();
    assert.ok(bienvenida.includes('admin'), 'Debe saludar al usuario "admin"');
  });

  it('US-02 [negativa]: login con contraseña incorrecta muestra error', async function () {
    await intentarLogin(driver, 'admin', 'contrasena_mala');

    const error = await driver.findElement(By.id('login-error'));
    await driver.wait(until.elementIsVisible(error), config.timeoutElem);
    const texto = await error.getText();
    assert.ok(texto.includes('incorrectos'), 'Debe indicar credenciales incorrectas');
  });

  it('US-02 [negativa]: login con usuario inexistente muestra error', async function () {
    await intentarLogin(driver, 'usuario_no_existe', 'admin123');

    const error = await driver.findElement(By.id('login-error'));
    await driver.wait(until.elementIsVisible(error), config.timeoutElem);
    const texto = await error.getText();
    assert.ok(texto.includes('incorrectos'), 'Debe indicar credenciales incorrectas');
  });

  it('US-02 [límite]: login con campos vacíos muestra error', async function () {
    await intentarLogin(driver, '', '');

    const error = await driver.findElement(By.id('login-error'));
    await driver.wait(until.elementIsVisible(error), config.timeoutElem);
    const texto = await error.getText();
    assert.ok(texto.includes('ambos campos'), 'Debe pedir completar ambos campos');
  });
});
