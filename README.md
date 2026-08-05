# Mini Sistema de Ganancias

Aplicación web sencilla para registrar mercancía, el capital invertido (propio o prestado) y calcular las ganancias al vender todos los productos. Trabaja con tres monedas: DOP, USD y EUR.

Proyecto base para la Tarea 4: Pruebas Automatizadas con Selenium.

## Funcionalidades

- Inicio de sesión (usuario: `admin`, contraseña: `admin123`).
- Registro de productos con cantidad, costo original, precio de venta y moneda (crear, listar, editar y eliminar).
- Registro del capital gastado, con opción de indicar si fue prestado.
- Tasas de cambio configurables a DOP.
- Resumen de ganancias: ingresos, capital, ganancia total, devolución del préstamo y ganancia propia.

## Cómo ejecutar

```bash
npm install
npm start
```

Abre `http://localhost:3000` en Chrome.

## Cómo ejecutar las pruebas

Con la aplicación corriendo:

```bash
npm test
```

El reporte HTML queda en `report/test-results.html` y las capturas automáticas en `screenshots/`.

## Enlaces

- Repositorio: [agregar enlace de GitHub]
- Tablero de historias de usuario (Jira): [agregar enlace del tablero]
- Video demostrativo: [agregar enlace del video]
