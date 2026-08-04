# Historias de Usuario — Mini Sistema de Ganancias

Estas historias deben copiarse al tablero de **Azure DevOps** (o **Jira**) en el proyecto/iteración correspondiente. Cada historia incluye criterios de **aceptación** y **rechazo**.

---

## US-01 — Inicio de sesión con credenciales válidas

**Como** usuario del mini sistema
**quiero** ingresar con usuario y contraseña correctos
**para** acceder a la gestión de mis productos y ganancias.

**Criterios de aceptación:**
- El sistema muestra el formulario de login al abrir la aplicación.
- Al ingresar el usuario `admin` y la contraseña `admin123` se accede a la vista principal.
- La vista principal saluda al usuario por su nombre.
- Al hacer clic en "Cerrar sesión" se regresa al formulario de login.

**Criterios de rechazo:**
- No se accede a la aplicación con credenciales vacías o incorrectas.
- No se muestra la vista principal sin haber iniciado sesión.

---

## US-02 — Inicio de sesión con credenciales inválidas

**Como** usuario
**quiero** recibir un mensaje de error claro al usar credenciales incorrectas
**para** saber que no pude autenticarme.

**Criterios de aceptación:**
- Con contraseña incorrecta se muestra el mensaje "Usuario o contraseña incorrectos".
- Con usuario inexistente se muestra el mismo mensaje de error.
- Con ambos campos vacíos se muestra el mensaje "Por favor, completa ambos campos".
- El mensaje de error se muestra junto al formulario de login.

**Criterios de rechazo:**
- No se permite el acceso con credenciales inválidas.
- No se muestra la vista principal en ningún caso de credenciales inválidas.

---

## US-03 — Crear producto

**Como** usuario
**quiero** registrar un producto con su costo original y precio de venta
**para** tener control de mi mercancía y calcular mis ganancias.

**Criterios de aceptación:**
- El formulario solicita nombre, costo original, precio de venta y moneda (DOP, USD, EUR).
- Al guardar un producto válido aparece una fila nueva en la tabla "Mis productos".
- El costo y el precio aceptan valores desde 0 (límite inferior) y con decimales.
- Se aceptan nombres largos (ej. 200 caracteres).

**Criterios de rechazo:**
- No se crea el producto si el nombre está vacío.
- No se crea el producto si el costo o el precio no son números mayores o iguales a 0.
- Se muestra un mensaje de error en los casos anteriores.

---

## US-04 — Listar productos

**Como** usuario
**quiero** ver la lista de todos mis productos registrados
**para** consultar la mercancía disponible.

**Criterios de aceptación:**
- La tabla "Mis productos" muestra todos los productos registrados con nombre, costo, precio y moneda.
- Cada producto se numera consecutivamente.
- Si no hay productos, se muestra el mensaje "No hay productos registrados todavía" y la tabla se oculta.

**Criterios de rechazo:**
- No se muestran productos que no hayan sido guardados.
- La tabla no debe mostrarse vacía si no hay productos.

---

## US-05 — Editar producto

**Como** usuario
**quiero** modificar los datos de un producto ya registrado
**para** corregir una cifra si me equivoqué al ingresarla.

**Criterios de aceptación:**
- El botón "Editar" de cada fila carga los datos del producto en el formulario.
- Al guardar la edición se actualizan nombre, costo, precio o moneda en la tabla.
- El precio anterior no debe persistir después de la actualización.

**Criterios de rechazo:**
- No se actualiza el producto si el nombre queda vacío; se muestra mensaje de error.
- No se actualiza el producto si el costo o precio son inválidos.
- Si hay un error, los datos originales del producto se mantienen.

---

## US-06 — Eliminar producto

**Como** usuario
**quiero** eliminar un producto que ya no necesito
**para** mantener mi lista de mercancía ordenada.

**Criterios de aceptación:**
- El botón "Eliminar" de cada fila borra ese producto de la lista.
- Al eliminar el último producto se muestra el mensaje de lista vacía.
- Al eliminar uno de varios productos, los demás se conservan.

**Criterios de rechazo:**
- No se eliminan productos al hacer clic en otros botones o elementos de la página.
- La eliminación no debe afectar a otros productos.

---

## US-07 — Calcular ganancias con capital prestado

**Como** usuario
**quiero** registrar mi capital invertido y saber si fue prestado
**para** conocer las ganancias totales, la devolución del préstamo y mi ganancia propia.

**Criterios de aceptación:**
- Puedo registrar el capital invertido, su moneda y marcar si fue prestado.
- Si fue prestado, puedo indicar el monto del préstamo.
- El resumen (en DOP) muestra: ingresos, capital, ganancia total, devolución de préstamo y ganancia propia.
- Con capital prestado: `Ganancia propia = Ganancia total − Devolución de préstamo`.
- Si el capital no fue prestado, la devolución se oculta y `Ganancia propia = Ganancia total`.
- Si la ganancia es negativa se muestra como pérdida (en rojo).
- Los productos en USD/EUR se convierten a DOP usando las tasas de cambio configurables.

**Criterios de rechazo:**
- No se muestra la devolución de préstamo si el capital no fue prestado.
- No se guarda el capital si el monto es negativo o no es numérico.
- No se guardan tasas de cambio menores o iguales a 0.
