(function () {
  'use strict';

  /* ============ Credenciales de prueba ============ */
  var USUARIO_VALIDO = 'admin';
  var CONTRASENA_VALIDA = 'admin123';

  /* ============ Persistencia (localStorage) ============ */
  var KEY_PRODUCTOS = 'productos';
  var KEY_CONFIG = 'config';
  var KEY_SESION = 'sesion';

  var CONFIG_DEFAULT = {
    capitalMonto: 0,
    capitalMoneda: 'DOP',
    prestado: false,
    montoPrestamo: 0,
    tasaUsdDop: 60,
    tasaEurDop: 70
  };

  function loadProductos() {
    try {
      return JSON.parse(localStorage.getItem(KEY_PRODUCTOS)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveProductos(productos) {
    localStorage.setItem(KEY_PRODUCTOS, JSON.stringify(productos));
  }

  function loadConfig() {
    try {
      var guardado = JSON.parse(localStorage.getItem(KEY_CONFIG));
      return Object.assign({}, CONFIG_DEFAULT, guardado);
    } catch (e) {
      return Object.assign({}, CONFIG_DEFAULT);
    }
  }

  function saveConfig(config) {
    localStorage.setItem(KEY_CONFIG, JSON.stringify(config));
  }

  /* ============ Utilidades ============ */
  function rateOf(moneda, config) {
    if (moneda === 'USD') return Number(config.tasaUsdDop) || 0;
    if (moneda === 'EUR') return Number(config.tasaEurDop) || 0;
    return 1;
  }

  function aDOP(monto, moneda, config) {
    return Number(monto) * rateOf(moneda, config);
  }

  function formatDOP(valor) {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor);
  }

  function mostrarMsg(el, texto, tipo) {
    el.textContent = texto;
    el.hidden = false;
    el.className = 'msg ' + tipo;
  }

  /* ============ Sesión ============ */
  function estaLogueado() {
    return sessionStorage.getItem(KEY_SESION) === 'activa';
  }

  function iniciarSesion(usuario) {
    sessionStorage.setItem(KEY_SESION, 'activa');
    sessionStorage.setItem('usuario', usuario);
  }

  function cerrarSesion() {
    sessionStorage.removeItem(KEY_SESION);
    sessionStorage.removeItem('usuario');
  }

  function mostrarVistaApp() {
    document.getElementById('login-view').hidden = true;
    document.getElementById('app-view').hidden = false;
    var usuario = sessionStorage.getItem('usuario') || '';
    document.getElementById('bienvenida').textContent = 'Hola, ' + usuario;
  }

  function mostrarVistaLogin() {
    document.getElementById('app-view').hidden = true;
    document.getElementById('login-view').hidden = false;
  }

  /* ============ Render: productos ============ */
  function renderProductos() {
    var productos = loadProductos();
    var tbody = document.getElementById('productos-tbody');
    var tabla = document.getElementById('tabla-productos');
    var vacio = document.getElementById('sin-productos');

    tbody.innerHTML = '';

    if (productos.length === 0) {
      vacio.hidden = false;
      tabla.hidden = true;
    } else {
      vacio.hidden = true;
      tabla.hidden = false;
      productos.forEach(function (p, i) {
        var tr = document.createElement('tr');
        tr.dataset.id = p.id;
        tr.innerHTML =
          '<td>' + (i + 1) + '</td>' +
          '<td class="nombre">' + esc(p.nombre) + '</td>' +
          '<td>' + p.cantidad + '</td>' +
          '<td>' + p.costo + '</td>' +
          '<td>' + p.precio + '</td>' +
          '<td>' + esc(p.moneda) + '</td>' +
          '<td><div class="acciones">' +
          '<button type="button" class="btn-editar btn-editar-prod" data-id="' + p.id + '">Editar</button>' +
          '<button type="button" class="btn-eliminar btn-eliminar-prod" data-id="' + p.id + '">Eliminar</button>' +
          '</div></td>';
        tbody.appendChild(tr);
      });
    }
    renderResumen();
  }

  function esc(texto) {
    var div = document.createElement('div');
    div.textContent = String(texto);
    return div.innerHTML;
  }

  /* ============ Render: resumen ============ */
  function renderResumen() {
    var productos = loadProductos();
    var config = loadConfig();

    var ingresos = 0;
    productos.forEach(function (p) {
      ingresos += aDOP(p.precio, p.moneda, config) * (p.cantidad || 1);
    });

    var capital = aDOP(config.capitalMonto, config.capitalMoneda, config);
    var gananciaTotal = ingresos - capital;
    var devolucion = config.prestado ? aDOP(config.montoPrestamo, config.capitalMoneda, config) : 0;
    var gananciaPropia = gananciaTotal - devolucion;

    document.getElementById('res-ingresos').textContent = formatDOP(ingresos);
    document.getElementById('res-ingresos').dataset.valor = ingresos;
    document.getElementById('res-capital').textContent = formatDOP(capital);
    document.getElementById('res-capital').dataset.valor = capital;
    document.getElementById('res-ganancia-total').textContent = formatDOP(gananciaTotal);
    document.getElementById('res-ganancia-total').className = 'value' + (gananciaTotal < 0 ? ' perdida' : '');
    document.getElementById('res-ganancia-total').dataset.valor = gananciaTotal;

    var devRow = document.getElementById('res-devolucion-row');
    if (config.prestado) {
      devRow.hidden = false;
      document.getElementById('res-devolucion').textContent = formatDOP(devolucion);
      document.getElementById('res-devolucion').dataset.valor = devolucion;
    } else {
      devRow.hidden = true;
    }

    var gPropia = document.getElementById('res-ganancia-propia');
    gPropia.textContent = formatDOP(gananciaPropia);
    gPropia.className = 'value' + (gananciaPropia < 0 ? ' perdida' : '');
    gPropia.dataset.valor = gananciaPropia;
  }

  /* ============ Login ============ */
  function bindLogin() {
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var error = document.getElementById('login-error');
      var usuario = document.getElementById('login-usuario').value.trim();
      var contrasena = document.getElementById('login-contrasena').value;

      if (usuario === '' || contrasena === '') {
        mostrarMsg(error, 'Por favor, completa ambos campos.', 'error');
        return;
      }
      if (usuario !== USUARIO_VALIDO || contrasena !== CONTRASENA_VALIDA) {
        mostrarMsg(error, 'Usuario o contraseña incorrectos.', 'error');
        return;
      }
      error.hidden = true;
      iniciarSesion(usuario);
      mostrarVistaApp();
      renderProductos();
    });

    document.getElementById('logout-btn').addEventListener('click', function () {
      cerrarSesion();
      mostrarVistaLogin();
    });
  }

  /* ============ CRUD productos ============ */
  function validarProducto() {
    var nombre = document.getElementById('prod-nombre').value.trim();
    var costo = document.getElementById('prod-costo').value;
    var precio = document.getElementById('prod-precio').value;
    var cantidad = document.getElementById('prod-cantidad').value;

    if (nombre === '') return 'El nombre del producto es obligatorio.';
    if (costo === '' || isNaN(Number(costo)) || Number(costo) < 0) return 'El costo debe ser un número mayor o igual a 0.';
    if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) return 'El precio de venta debe ser un número mayor o igual a 0.';
    if (cantidad === '' || !Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) return 'La cantidad debe ser un número entero mayor o igual a 1.';
    return null;
  }

  function bindProductoForm() {
    document.getElementById('producto-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('prod-msg');
      var error = validarProducto();
      if (error) {
        mostrarMsg(msg, error, 'error');
        return;
      }

      var productos = loadProductos();
      var id = document.getElementById('prod-id').value;
      var datos = {
        nombre: document.getElementById('prod-nombre').value.trim(),
        cantidad: Number(document.getElementById('prod-cantidad').value),
        costo: Number(document.getElementById('prod-costo').value),
        precio: Number(document.getElementById('prod-precio').value),
        moneda: document.getElementById('prod-moneda').value
      };

      if (id) {
        var idx = productos.findIndex(function (p) { return String(p.id) === id; });
        if (idx >= 0) {
          datos.id = productos[idx].id;
          productos[idx] = datos;
          mostrarMsg(msg, 'Producto actualizado correctamente.', 'ok');
        } else {
          mostrarMsg(msg, 'No se encontró el producto.', 'error');
        }
      } else {
        datos.id = Date.now();
        productos.push(datos);
        mostrarMsg(msg, 'Producto creado correctamente.', 'ok');
      }

      saveProductos(productos);
      limpiarProductoForm();
      renderProductos();
    });

    document.getElementById('prod-reset-btn').addEventListener('click', function () {
      limpiarProductoForm();
    });

    document.getElementById('productos-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var id = btn.dataset.id;
      var productos = loadProductos();
      var idx = productos.findIndex(function (p) { return String(p.id) === id; });
      if (idx < 0) return;

      if (btn.classList.contains('btn-editar-prod')) {
        var p = productos[idx];
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-nombre').value = p.nombre;
        document.getElementById('prod-cantidad').value = p.cantidad;
        document.getElementById('prod-costo').value = p.costo;
        document.getElementById('prod-precio').value = p.precio;
        document.getElementById('prod-moneda').value = p.moneda;
        document.getElementById('prod-save-btn').textContent = 'Actualizar producto';
        var msg = document.getElementById('prod-msg');
        msg.hidden = true;
        document.getElementById('prod-nombre').focus();
      }

      if (btn.classList.contains('btn-eliminar-prod')) {
        productos.splice(idx, 1);
        saveProductos(productos);
        renderProductos();
      }
    });
  }

  function limpiarProductoForm() {
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-cantidad').value = '';
    document.getElementById('prod-costo').value = '';
    document.getElementById('prod-precio').value = '';
    document.getElementById('prod-moneda').value = 'DOP';
    document.getElementById('prod-save-btn').textContent = 'Guardar producto';
  }

  /* ============ Capital ============ */
  function bindCapitalForm() {
    var prestado = document.getElementById('cap-prestado');
    var montoPrestamo = document.getElementById('cap-monto-prestamo');

    prestado.addEventListener('change', function () {
      montoPrestamo.disabled = !prestado.checked;
      if (!prestado.checked) montoPrestamo.value = '';
    });

    document.getElementById('capital-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('cap-msg');
      var config = loadConfig();
      var monto = document.getElementById('cap-monto').value;

      if (monto === '' || isNaN(Number(monto)) || Number(monto) < 0) {
        mostrarMsg(msg, 'El capital debe ser un número mayor o igual a 0.', 'error');
        return;
      }

      config.capitalMonto = Number(monto);
      config.capitalMoneda = document.getElementById('cap-moneda').value;
      config.prestado = prestado.checked;

      if (config.prestado) {
        var pm = document.getElementById('cap-monto-prestamo').value;
        if (pm === '' || isNaN(Number(pm)) || Number(pm) < 0) {
          mostrarMsg(msg, 'Indica el monto prestado.', 'error');
          return;
        }
        config.montoPrestamo = Number(pm);
      } else {
        config.montoPrestamo = 0;
      }

      saveConfig(config);
      mostrarMsg(msg, 'Capital guardado correctamente.', 'ok');
      renderResumen();
    });
  }

  /* ============ Tasas de cambio ============ */
  function bindTasasForm() {
    document.getElementById('tasas-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('tasas-msg');
      var config = loadConfig();
      var usd = document.getElementById('tasa-usd').value;
      var eur = document.getElementById('tasa-eur').value;

      if (usd === '' || Number(usd) <= 0) {
        mostrarMsg(msg, 'La tasa USD debe ser mayor a 0.', 'error');
        return;
      }
      if (eur === '' || Number(eur) <= 0) {
        mostrarMsg(msg, 'La tasa EUR debe ser mayor a 0.', 'error');
        return;
      }

      config.tasaUsdDop = Number(usd);
      config.tasaEurDop = Number(eur);
      saveConfig(config);
      mostrarMsg(msg, 'Tasas guardadas correctamente.', 'ok');
      renderResumen();
    });
  }

  /* ============ Carga de datos al abrir ============ */
  function cargarDatosGuardados() {
    var config = loadConfig();
    document.getElementById('cap-monto').value = config.capitalMonto;
    document.getElementById('cap-moneda').value = config.capitalMoneda;
    document.getElementById('cap-prestado').checked = config.prestado;
    var montoPrestamo = document.getElementById('cap-monto-prestamo');
    montoPrestamo.disabled = !config.prestado;
    montoPrestamo.value = config.prestado ? config.montoPrestamo : '';
    document.getElementById('tasa-usd').value = config.tasaUsdDop;
    document.getElementById('tasa-eur').value = config.tasaEurDop;
  }

  /* ============ Init ============ */
  function init() {
    bindLogin();
    bindProductoForm();
    bindCapitalForm();
    bindTasasForm();
    cargarDatosGuardados();

    if (estaLogueado()) {
      mostrarVistaApp();
      renderProductos();
    } else {
      mostrarVistaLogin();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
