const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const config = require('./config');
const { crearDriver } = require('./helpers/driver');
const { login } = require('./helpers/login');
const { capturar, nombreSeguro } = require('./helpers/screenshots');

describe('CRUD de productos (US-03 a US-06)', function () {
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

  async function llenarFormProducto(nombre, costo, precio, cantidad, moneda) {
    const n = await driver.findElement(By.id('prod-nombre'));
    await n.clear();
    await n.sendKeys(nombre);

    const c = await driver.findElement(By.id('prod-costo'));
    await c.clear();
    await c.sendKeys(costo);

    const p = await driver.findElement(By.id('prod-precio'));
    await p.clear();
    await p.sendKeys(precio);

    const q = await driver.findElement(By.id('prod-cantidad'));
    await q.clear();
    await q.sendKeys(cantidad);

    if (moneda) {
      const sel = await driver.findElement(By.id('prod-moneda'));
      await sel.findElement(By.css('option[value="' + moneda + '"]')).click();
    }
  }

  async function crearProducto(nombre, costo, precio, cantidad, moneda) {
    await llenarFormProducto(nombre, costo, precio, cantidad, moneda);
    await driver.findElement(By.id('prod-save-btn')).click();
  }

  async function contarFilas() {
    return (await driver.findElements(By.css('#productos-tbody tr'))).length;
  }

  it('US-03 [camino feliz]: crear un producto válido lo muestra en la tabla', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('Camisa'), 'La fila debe contener el nombre');
    assert.ok(texto.includes('750'), 'La fila debe contener el precio de venta');
    assert.ok(texto.includes('2'), 'La fila debe contener la cantidad');
  });

  it('US-03 [negativa]: crear producto con campos vacíos muestra error', async function () {
    await driver.findElement(By.id('prod-save-btn')).click();

    const msg = await driver.findElement(By.id('prod-msg'));
    await driver.wait(until.elementIsVisible(msg), config.timeoutElem);
    assert.ok((await msg.getText()).includes('obligatorio'), 'Debe pedir el nombre');
    assert.strictEqual(await contarFilas(), 0, 'No debe crearse el producto');
  });

  it('US-03 [negativa]: crear producto con cantidad vacía muestra error', async function () {
    await llenarFormProducto('Camisa', '500', '750', '', 'DOP');
    await driver.findElement(By.id('prod-save-btn')).click();

    const msg = await driver.findElement(By.id('prod-msg'));
    await driver.wait(until.elementIsVisible(msg), config.timeoutElem);
    assert.ok((await msg.getText()).includes('cantidad'), 'Debe pedir la cantidad');
    assert.strictEqual(await contarFilas(), 0, 'No debe crearse el producto');
  });

  it('US-03 [límite]: crear producto con cantidad en 1 (límite inferior)', async function () {
    await crearProducto('Gratis', '0', '0', '1', 'DOP');

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    assert.strictEqual(await contarFilas(), 1);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('1'), 'La fila debe mostrar la cantidad');
  });

  it('US-03 [límite]: crear producto con nombre de 200 caracteres', async function () {
    const nombreLargo = 'x'.repeat(200);
    await crearProducto(nombreLargo, '10', '20', '3', 'DOP');

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('xxx'), 'La fila debe contener el nombre largo');
  });

  it('US-04 [camino feliz]: listar dos productos registrados', async function () {
    await crearProducto('Collar', '100', '200', '5', 'DOP');
    await crearProducto('Zapatos', '300', '450', '4', 'DOP');

    await driver.wait(async () => (await contarFilas()) === 2, config.timeoutElem);
    assert.strictEqual(await contarFilas(), 2);
  });

  it('US-04 [negativa/límite]: lista vacía muestra mensaje y oculta la tabla', async function () {
    const vacio = await driver.findElement(By.id('sin-productos'));
    await driver.wait(until.elementIsVisible(vacio), config.timeoutElem);
    assert.strictEqual(await vacio.isDisplayed(), true);
    assert.strictEqual(await driver.findElement(By.id('tabla-productos')).isDisplayed(), false);
  });

  it('US-05 [camino feliz]: editar un producto actualiza sus cifras', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');
    await driver.wait(until.elementLocated(By.css('.btn-editar-prod')), config.timeoutElem);

    await driver.findElement(By.css('.btn-editar-prod')).click();
    await llenarFormProducto('Camisa nueva', '550', '800', '3', 'DOP');
    await driver.findElement(By.id('prod-save-btn')).click();

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('Camisa nueva'), 'El nombre debe actualizarse');
    assert.ok(texto.includes('800'), 'El precio debe actualizarse');
    assert.ok(texto.includes('3'), 'La cantidad debe actualizarse');
    assert.ok(!texto.includes('750'), 'El precio anterior no debe persistir');
  });

  it('US-05 [negativa]: editar con nombre vacío muestra error y no modifica', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');
    await driver.wait(until.elementLocated(By.css('.btn-editar-prod')), config.timeoutElem);

    await driver.findElement(By.css('.btn-editar-prod')).click();
    await llenarFormProducto('', '550', '800', '3', 'DOP');
    await driver.findElement(By.id('prod-save-btn')).click();

    const msg = await driver.findElement(By.id('prod-msg'));
    await driver.wait(until.elementIsVisible(msg), config.timeoutElem);
    assert.ok((await msg.getText()).includes('obligatorio'));

    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('Camisa'), 'El nombre original debe mantenerse');
  });

  it('US-05 [límite]: editar dejando el costo en cero (límite inferior)', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');
    await driver.wait(until.elementLocated(By.css('.btn-editar-prod')), config.timeoutElem);

    await driver.findElement(By.css('.btn-editar-prod')).click();
    await llenarFormProducto('Camisa', '0', '750', '2', 'DOP');
    await driver.findElement(By.id('prod-save-btn')).click();

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('0'), 'El costo actualizado debe ser 0');
  });

  it('US-06 [camino feliz]: eliminar un producto lo quita de la lista', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');
    await driver.wait(until.elementLocated(By.css('.btn-eliminar-prod')), config.timeoutElem);

    await driver.findElement(By.css('.btn-eliminar-prod')).click();

    const vacio = await driver.findElement(By.id('sin-productos'));
    await driver.wait(until.elementIsVisible(vacio), config.timeoutElem);
    assert.strictEqual(await contarFilas(), 0);
  });

  it('US-06 [negativa/límite]: eliminar uno de varios conserva los demás', async function () {
    await crearProducto('Camisa', '500', '750', '2', 'DOP');
    await crearProducto('Zapatos', '300', '450', '4', 'DOP');

    await driver.wait(async () => (await driver.findElements(By.css('.btn-eliminar-prod'))).length === 2, config.timeoutElem);
    const botones = await driver.findElements(By.css('.btn-eliminar-prod'));
    await botones[0].click();

    await driver.wait(async () => (await contarFilas()) === 1, config.timeoutElem);
    const texto = await (await driver.findElement(By.css('#productos-tbody tr'))).getText();
    assert.ok(texto.includes('Zapatos'), 'Debe quedar el producto no eliminado');
  });
});
