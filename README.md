# RutaMerch — Planning de rutas y materiales (sitio estático)

App **informativa** (solo lectura) que muestra a los merch su ruta del día y al almacén los
materiales a preparar. La **base de datos es un Google Sheet** publicado como CSV.

- Front-end: un solo `index.html` (sin build, sin backend).
- Datos: Google Sheet ▸ pestaña `PLANNING` ▸ *Publicar en la web* como CSV.
- Hosting: Netlify (deploy automático desde este repo de GitHub).

## Dos versiones en este repo

| Carpeta | Versión | Hosting | Sheet | Cuándo usarla |
|---|---|---|---|---|
| `/` (raíz) | Sitio estático | Netlify | Publicado como CSV (lectura pública) | Quieres dominio propio / GitHub + Netlify |
| `apps-script/` | Google Apps Script | Google (link del Web App) | Privado | Prefieres que el Sheet **no** sea público |

Ambas muestran las mismas vistas (Oficina / Merch / Almacén). Elige una; no necesitas las dos.
Los pasos de la versión Apps Script están en `apps-script/INSTRUCCIONES.md`.

---

## 1) Preparar el Google Sheet

La hoja `PLANNING` debe tener estas columnas (fila 1 = encabezados):

`Fecha | Merch | Cadena | PDV | Dirección | Hora | Descripción | Materiales | Estado`

- **Fecha**: `2026-09-02` (o `02/09/2026`). El app filtra por día.
- **Materiales**: formato `Nombre xCantidad; Otro xCantidad` → `Dispenser exhibidor x1; Afiche A3 x4`.
- La lista de merch se arma sola con los nombres de la columna **Merch**.

## 2) Publicar la hoja como CSV

En el Sheet: **Archivo ▸ Compartir ▸ Publicar en la web** ▸ selecciona la pestaña **PLANNING**
▸ formato **CSV** ▸ **Publicar**. Copia el enlace (termina en `output=csv`).

> ⚠️ Publicar en la web hace que **cualquiera con ese enlace pueda leer** esos datos
> (nombres de merch, tiendas, direcciones). Úsalo solo si esa información puede ser de lectura pública.

## 3) Pegar el enlace en el código

En `index.html`, arriba del `<script>`, reemplaza:

```js
var SHEET_CSV_URL = "PEGA_AQUI_TU_ENLACE_CSV";
```

por tu enlace CSV real. Haz commit y push del cambio.

## 4) Desplegar en Netlify

1. Entra a https://app.netlify.com ▸ **Add new site ▸ Import an existing project**.
2. Conecta **GitHub** y elige el repo `planningmerchs`.
3. Build command: *(vacío)* · Publish directory: `.` · **Deploy**.
4. Netlify te da una URL (ej. `planningmerchs.netlify.app`). Ese es el link para tu equipo.

Cada `git push` a `main` vuelve a desplegar automáticamente. Cambiar datos en el Sheet
**no** requiere redeploy: el app siempre lee lo último (con el botón ⟳ o al recargar).

---

## Uso
- **Oficina**: vista general del día. · **Merch**: elige su nombre → su ruta. · **Almacén**: consolidado + kit por merch.
- Es solo lectura por diseño. Oficina edita todo en el Google Sheet.
