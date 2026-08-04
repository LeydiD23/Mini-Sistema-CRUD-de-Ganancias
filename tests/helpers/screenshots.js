const fs = require('fs');
const path = require('path');
const addContext = require('mochawesome/addContext');
const config = require('../config');

function nombreSeguro(titulo) {
  return String(titulo)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'captura';
}

async function capturar(driver, nombre, mochaCtx) {
  if (!driver) return null;

  const dir = config.dirScreenshots;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ruta = path.join(dir, nombre + '-' + stamp + '.png');

  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(ruta, img, 'base64');

    if (mochaCtx) {
      try {
        addContext(mochaCtx, 'data:image/png;base64,' + img);
      } catch (e) {
        /* no romper la prueba si falla el embed */
      }
    }
  } catch (e) {
    return null;
  }

  return ruta;
}

module.exports = { capturar, nombreSeguro };
