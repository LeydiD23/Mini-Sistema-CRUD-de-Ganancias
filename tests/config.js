const path = require('path');

module.exports = {
  baseUrl: 'http://localhost:3000',
  usuario: 'admin',
  contrasena: 'admin123',
  timeoutElem: 10000,
  headless: false,
  dirScreenshots: path.join(__dirname, '..', 'screenshots'),
  dirReport: path.join(__dirname, '..', 'report')
};
