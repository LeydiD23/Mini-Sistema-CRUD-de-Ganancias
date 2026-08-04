# Mini Sistema de Ganancias

Mini sistema web (JavaScript puro, sin API) para registrar la mercancía, el capital invertido (propio o prestado) y calcular las ganancias al vender todos los productos, trabajando con tres monedas: **DOP**, **USD** y **EUR**.

Proyecto base para la **Tarea 4: Pruebas Automatizadas con Selenium**.

## Funcionalidades

- **Inicio de sesión** simulado con credenciales fijas: `admin` / `admin123`.
- **CRUD de productos** (crear, listar, editar para corregir cifras, eliminar) con nombre, cantidad comprada, costo original, precio de venta y moneda.
- **Capital gastado**: monto invertido manualmente, con opción de indicar que fue **prestado por una tercera persona** y el monto del préstamo.
- **Tasas de cambio** configurables a DOP (USD y EUR).
- **Resumen de ganancias en DOP**:
  - Ingresos si se vende todo (precio de venta × cantidad de cada producto)
  - Capital gastado
  - Ganancia total
  - Devolución de préstamo (si el capital fue prestado)
  - **Ganancia propia** (ganancia total − devolución)
  - Si la ganancia es negativa se muestra como pérdida (en rojo).

Los datos se guardan en `localStorage` del navegador.

## Requisitos

- Node.js 18 o superior
- Chrome (las pruebas usan Selenium WebDriver con Chrome)

## Cómo ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar la aplicación
npm start
# Abre http://localhost:3000
```

## Cómo ejecutar las pruebas (Selenium)

Con la aplicación corriendo en `http://localhost:3000`:

```bash
# Suite completa + reporte HTML (mochawesome)
npm test

# Suite con reporter en consola (más rápido para depurar)
npm run test:spec
```

Resultados:

- Reporte HTML: `report/test-results.html`
- Capturas automáticas por escenario: `screenshots/`

## Estructura

```
├── server.js                    # servidor estático (sin API)
├── CRUD/
│   ├── index.html               # login + CRUD + capital + tasas + resumen
│   ├── style.css
│   └── script.js
├── tests/
│   ├── config.js                # URL, credenciales, timeouts
│   ├── helpers/
│   │   ├── driver.js            # WebDriver de Chrome
│   │   ├── login.js             # helpers de login
│   │   └── screenshots.js       # captura por escenario (archivo + reporte)
│   ├── test_login.js            # US-01, US-02
│   ├── test_crud.js             # US-03 a US-06
│   └── test_resumen.js          # US-07
└── docs/
    └── historias_usuario.md     # 7 historias de usuario (para Azure DevOps / Jira)
```

## Historias de usuario

| ID | Historia |
|----|----------|
| US-01 | Inicio de sesión con credenciales válidas |
| US-02 | Inicio de sesión con credenciales inválidas |
| US-03 | Crear producto |
| US-04 | Listar productos |
| US-05 | Editar producto |
| US-06 | Eliminar producto |
| US-07 | Calcular ganancias con capital prestado |

Cada historia incluye criterios de aceptación y rechazo (ver `docs/historias_usuario.md`).

## Entregables de la tarea

- **Repositorio de código**: este repositorio en GitHub.
- **Historias de usuario**: tablero en Azure DevOps o Jira (copiar desde `docs/historias_usuario.md`).
- **Video demostrativo**: en YouTube o OneDrive (ejecutar `npm start` + `npm test` y mostrar el reporte y capturas).
- **Reporte HTML + capturas**: generados automáticamente con `npm test`.
