# RutaMerch — App web sobre Google Sheets (Apps Script)

Base de datos = tu Google Sheet. El app solo **muestra** rutas y materiales a merch y almacén.
Oficina trabaja siempre en el Sheet (pestaña **PLANNING**).

---

## 1) Crear el proyecto (una sola vez, ~10 min)

1. Entra a **https://sheets.new** (crea un Google Sheet en blanco). Ponle nombre, ej. `RutaMerch - BASE`.
2. Menú **Extensiones ▸ Apps Script**. Se abre el editor.
3. Borra el contenido de `Código.gs` y pega **todo** el archivo **`Codigo.gs`**.
4. Pulsa el **＋** junto a "Archivos" ▸ **HTML**. Nómbralo exactamente **`Index`** (sin `.html`). Borra su contenido y pega **todo** el archivo **`Index.html`**.
5. Guarda (💾 o Ctrl+S).

## 2) Preparar el Sheet automáticamente

1. En el editor, en la barra de funciones elige **`setup`** y pulsa **Ejecutar**.
2. La primera vez pide **autorización**: Revisar permisos ▸ elige tu cuenta ▸ "Configuración avanzada" ▸ *Ir a (proyecto)* ▸ **Permitir**.
3. Vuelve al Sheet: verás 3 pestañas creadas → **PLANNING**, **MERCHS**, **MATERIALES**, con datos de ejemplo.

## 3) Publicar el link del app

1. En el editor: **Implementar ▸ Nueva implementación**.
2. Tipo (engranaje) ▸ **Aplicación web**.
3. Configura:
   - **Ejecutar como:** `Yo (tu correo)`  ← importante, así lee el Sheet por ti.
   - **Quién tiene acceso:** ver abajo.
4. **Implementar** ▸ copia la **URL de la aplicación web**. Ese es el link que compartes.

### ¿Qué poner en "Quién tiene acceso"?
- Si tus merch tienen correo **@ttaudit** (Google Workspace) → **"Cualquier usuario de Traditional Trade Audit"** (más seguro).
- Si entran con su correo personal / sin cuenta → **"Cualquier persona con el enlace"**. El link es privado; solo quien lo tenga entra.

> Cada vez que cambies el **código** debes hacer **Implementar ▸ Gestionar implementaciones ▸ ✏️ ▸ Nueva versión**. Cambiar **datos en el Sheet NO** requiere republicar: el app siempre lee lo último.

---

## 4) Uso diario (oficina)

Todo se maneja en la pestaña **PLANNING**. Una fila = una tarea:

| Columna | Ejemplo | Nota |
|---|---|---|
| Fecha | 2026-09-02 | El app filtra por este día |
| Merch | Ana Torres | Debe coincidir con la pestaña MERCHS (hay menú desplegable) |
| Cadena | TAMBO | Menú: TAMBO/OXXO/REPSOL/PRIMAX/Otro |
| PDV | Tambo Av. Larco | Nombre de la tienda |
| Dirección | Av. Larco 345, Miraflores | Genera link a Google Maps |
| Hora | 09:30 | Ordena la ruta |
| Descripción | Instalar dispenser VUSE | La tarea |
| Materiales | `Dispenser exhibidor x1; Cinta doble contacto x2` | **Formato: `Nombre xCantidad`** separado por `;` |
| Estado | Pendiente | Opcional (Pendiente/En camino/Completada) |

- **Agregar un merch:** escríbelo en la pestaña **MERCHS**. Aparecerá en el menú del app y del PLANNING.
- **Materiales:** usa nombres del catálogo (pestaña MATERIALES) para que el consolidado de almacén sume bien.

## 5) Uso (merch y almacén)

Abren el mismo link:
- **Merch** → botón *Merch* → elige su nombre → ve su ruta del día (con mapa y materiales).
- **Almacén** → botón *Almacén* → ve el **consolidado** de materiales a picar + el **kit por merch**.
- **Oficina** → botón *Oficina* → vista general de todo el día.

---

## Notas
- Es **informativo (solo lectura)** por diseño en esta primera versión. Cambios se hacen en el Sheet.
- Más adelante se puede agregar: que el merch marque "completada" y suba foto (escribiendo de vuelta al Sheet), notificaciones, y control de acceso por PIN.
- Si un merch no ve su ruta: revisa que su nombre en PLANNING esté **idéntico** al de la pestaña MERCHS.
