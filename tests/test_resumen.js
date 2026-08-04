const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const config = require('./config');
const { crearDriver } = require('./helpers/driver');
const { login } = require('./helpers/login');
const { capturar, nombreSeguro } = require('./helpers/screenshots');

describe('Resumen de ganancias (US-07)', function () {
  this.timeout(120000);
  let driver;

  beforeEach(async function () {
    driver = await crearDriver();
    await login(driver);
  });

  afterEach(async function () {
    if (driver) {
      await capturar(driver, nombreSeguro(this.currentTest.title), this);
      await driver.quit();
    }
  });

  async function crearProducto(nombre, costo, precio, moneda) {
    const n = await driver.findElement(By.id('prod-nombre'));
    await n.clear();
    await n.sendKeys(nombre);
    const c = await driver.findElement(By.id('prod-costo'));
    await c.clear();
    await c.sendKeys(costo);
    const p = await driver.findElement(By.id('prod-precio'));
    await p.clear();
    await p.sendKeys(precio);
    if (moneda) {
      const sel = await driver.findElement(By.id('prod-moneda'));
      await sel.findElement(By.css('option[value="' + moneda + '"]')).click();
    }
    await driver.findElement(By.id('prod-save-btn')).click();
  }

  async function guardarCapital(monto, moneda, prestado, montoPrestamo) {
    const cap = await driver.findElement(By.id('cap-monto'));
    await cap.clear();
    await cap.sendKeys(monto);

    const capMoneda = await driver.findElement(By.id('cap-moneda'));
    await capMoneda.findElement(By.css('option[value="' + moneda + '"]')).click();

    const chk = await driver.findElement(By.id('cap-prestado'));
    const estaMarcado = await chk.isSelected();
    if (prestado && !estaMarcado) await chk.click();
    if (!prestado && estaMarcado) await chk.click();

    if (prestado) {
      const pm = await driver.findElement(By.id('cap-monto-prestamo'));
      await pm.clear();
      await pm.sendKeys(montoPrestamo);
    }

    await driver.findElement(By.id('cap-save-btn')).click();
    const msg = await driver.findElement(By.id('cap-msg'));
    await driver.wait(until.elementIsVisible(msg), config.timeoutElem);
  }

  async function guardarTasas(usd, eur) {
    const t1 = await driver.findElement(By.id('tasa-usd'));
    await t1.clear();
    await t1.sendKeys(usd);
    const t2 = await driver.findElement(By.id('tasa-eur'));
    await t2.clear();
    await t2.sendKeys(eur);
    await driver.findElement(By.id('tasas-save-btn')).click();
    const msg = await driver.findElement(By.id('tasas-msg'));
    await driver.wait(until.elementIsVisible(msg), config.timeoutElem);
  }

  async function valorDe(id) {
    const attr = await (await driver.findElement(By.id(id))).getAttribute('data-valor');
    return parseFloat(attr);
  }

  it('US-07 [camino feliz]: con capital prestado calcula devolución y ganancia propia', async function () {
    await crearProducto('Laptop', '5000', '20000', 'DOP');
    await guardarCapital('10000', 'DOP', true, '6000');

    assert.ok(Math.abs(await valorDe('res-ingresos') - 20000) < 0.01, 'Ingresos = 20000');
    assert.ok(Math.abs(await valorDe('res-capital') - 10000) < 0.01, 'Capital = 10000');
    assert.ok(Math.abs(await valorDe('res-ganancia-total') - 10000) < 0.01, 'Ganancia total = 10000');
    assert.ok(Math.abs(await valorDe('res-devolucion') - 6000) < 0.01, 'Devolución = 6000');
    assert.ok(Math.abs(await valorDe('res-ganancia-propia') - 4000) < 0.01, 'Ganancia propia = 4000');

    const row = await driver.findElement(By.id('res-devolucion-row'));
    assert.strictEqual(await row.isDisplayed(), true, 'La devolución debe ser visible');
  });

  it('US-07 [negativa]: capital sin prestar oculta devolución y marca la pérdida', async function () {
    await crearProducto('Mesa', '5000', '8000', 'DOP');
    await guardarCapital('10000', 'DOP', false, null);

    assert.ok(Math.abs(await valorDe('res-ganancia-total') - (-2000)) < 0.01, 'Ganancia total = -2000');
    assert.ok(Math.abs(await valorDe('res-ganancia-propia') - (-2000)) < 0.01, 'Ganancia propia = -2000');

    const row = await driver.findElement(By.id('res-devolucion-row'));
    assert.strictEqual(await row.isDisplayed(), false, 'La devolución no debe mostrarse');

    const clase = await (await driver.findElement(By.id('res-ganancia-propia'))).getAttribute('class');
    assert.ok(clase.includes('perdida'), 'La ganancia negativa debe marcarse como pérdida');
  });

  it('US-07 [límite]: capital en cero y tasas mínimas dan ganancia propia = ingresos', async function () {
    await guardarTasas('0.01', '0.01');
    await crearProducto('Collar', '1', '2', 'USD');
    await guardarCapital('0', 'DOP', false, null);

    assert.ok(Math.abs(await valorDe('res-ingresos') - 0.02) < 0.001, 'Ingresos = 0.02');
    assert.ok(Math.abs(await valorDe('res-capital') - 0) < 0.001, 'Capital = 0');
    assert.ok(Math.abs(await valorDe('res-ganancia-propia') - 0.02) < 0.001, 'Ganancia propia = 0.02');
  });
});
