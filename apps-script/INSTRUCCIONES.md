# RutaMerch — App unida a tu Google Sheet (Apps Script)

El app **lee tu Google Sheet** (pestaña PLANNING) y muestra las rutas al merch y los
materiales al almacén. El Sheet queda **privado** (no se publica nada). Solo lectura.

Tu Sheet: `https://docs.google.com/spreadsheets/d/1-Veqcz2BN5EceTSKEG0XkOFumzDNKr1z0onaoocMSTc/edit`

---

## 1) Pegar el código (una sola vez)

1. Abre tu Google Sheet.
2. Menú **Extensiones ▸ Apps Script**. Se abre el editor (queda **unido** a este Sheet).
3. Borra lo que haya en `Código.gs` y pega **todo** el archivo **`Codigo.gs`**.
4. Pulsa **＋ ▸ HTML**, nómbralo exactamente **`Index`**, borra su contenido y pega **`Index.html`**.
5. Guarda (Ctrl+S).

## 2) Preparar las pestañas

1. Arriba, en el selector de función, elige **`setup`** ▸ **Ejecutar**.
2. La primera vez pide **autorización**: elige tu cuenta ▸ "Configuración avanzada" ▸ *Ir a (proyecto)* ▸ **Permitir**.
3. Vuelve al Sheet: verás las pestañas **PLANNING**, **MERCHS**, **MATERIALES**.
   - `setup` **no borra** tus datos: si PLANNING ya tenía filas, las respeta; solo agrega ejemplos si estaba vacío.

## 3) Publicar el link del app

1. En el editor: **Implementar ▸ Nueva implementación**.
2. Engranaje ▸ **Aplicación web**.
3. Configura:
   - **Ejecutar como:** `Yo (tu correo)`  ← así lee el Sheet privado por ti.
   - **Quién tiene acceso:**
       - Si tus merch tienen correo **@ttaudit** → *"Cualquier usuario de Traditional Trade Audit"* (recomendado).
       - Si entran con correo personal → *"Cualquier persona con el enlace"*.
4. **Implementar** ▸ copia la **URL de la aplicación web**. Ese es el link para tu equipo.

> Si cambias el **código**, republica: *Implementar ▸ Gestionar implementaciones ▸ ✏️ ▸ Nueva versión*.
> Cambiar **datos en el Sheet NO** requiere republicar: el app siempre lee lo último (botón ⟳).

---

## Uso diario

Todo en la pestaña **PLANNING** (una fila = una tarea):

| Columna | Ejemplo |
|---|---|
| Fecha | 2026-09-02 |
| Merch | Ana Torres  *(elige del menú; se alimenta de la pestaña MERCHS)* |
| Cadena | TAMBO |
| PDV | Tambo Av. Larco |
| Dirección | Av. Larco 345, Miraflores |
| Hora | 09:30 |
| Descripción | Instalar dispenser VUSE |
| Materiales | `Dispenser exhibidor x1; Afiche A3 x4`  *(formato `Nombre xCantidad; ...`)* |
| Estado | Pendiente |

- **Agregar un merch:** escríbelo en la pestaña **MERCHS**.
- En el app: **Merch** elige su nombre y ve su ruta; **Almacén** ve el consolidado + kit por merch; **Oficina** ve todo.
- Si un merch no ve su ruta: revisa que su nombre en PLANNING sea **idéntico** al de la pestaña MERCHS.
