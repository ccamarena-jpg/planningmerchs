# RutaMerch — Planning de rutas y materiales

App para asignar rutas a merch y avisar materiales a almacén. **Ahora con captura de
datos desde la app** (crear, editar, eliminar, cargar masivo). La base de datos es tu
**Google Sheet privado**.

## Arquitectura

```
Navegador (celular)
   │
   ▼
index.html  ──►  /api/exec  ──►  Apps Script (/exec)  ──►  Google Sheet (PLANNING)
 (Vercel)        (Vercel func)     (lee y escribe)          (privado)
```

- **index.html** — front-end en Vercel (GitHub → deploy automático).
- **api/exec.js** — mini-puente en Vercel; reenvía al Apps Script (evita bloqueos de permisos del navegador).
- **apps-script/Codigo.gs** — backend: lee y escribe el Sheet. Se pega en el editor de Apps Script del Sheet.

El Sheet **no se publica** ni se hace público: solo el Apps Script (que corre como tú) lo toca.

---

## Puesta en marcha

### 1) Backend (Apps Script)
1. Abre tu Google Sheet ▸ **Extensiones ▸ Apps Script**.
2. Pega **`apps-script/Codigo.gs`** en `Código.gs`. Guarda.
3. Ejecuta la función **`setup`** una vez (autoriza). Verifica/crea las pestañas.
4. **Implementar ▸ Gestionar implementaciones ▸ ✏️ (editar) ▸ Versión: Nueva versión**.
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** *Cualquier persona*.
   - Implementar. (La URL `/exec` no cambia entre versiones.)

> Si el `/exec` cambia alguna vez, actualiza `APPS_SCRIPT_URL` en `api/exec.js`.

### 2) Front-end (Vercel)
- Ya está en este repo. En https://vercel.com importas `ccamarena-jpg/planningmerchs`
  (Framework: *Other*, sin build). Cada `git push` redepliega solo.

---

## Uso
- **Oficina:** Planning (crear/editar/eliminar), Avance (progreso por merch), Importar (Excel), Datos (merch y materiales).
- **Merch:** elige su nombre, ve su ruta y marca *En camino / Completada*.
- **Almacén:** consolidado + kit por merch; marca *Preparado / Entregado*.

Oficina también puede seguir escribiendo directo en la pestaña PLANNING del Sheet; la app refleja ambos.

## Nota de seguridad (piloto)
El despliegue del Apps Script está en "Cualquier persona", así que por ahora quien tenga
las URLs podría escribir. Para un piloto interno está bien; cuando quieras se le agrega un
token para cerrarlo.

## Estructura del Sheet (pestaña PLANNING)
`Fecha | Merch | Cadena | PDV | Dirección | Hora | Descripción | Materiales | Estado | Almacén`
Materiales: `Nombre xCantidad; Otro xCantidad`.
