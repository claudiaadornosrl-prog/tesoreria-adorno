# Tesorería · Claudia Adorno SRL

Módulo de gestión financiera consolidada. Integra cuentas bancarias, billeteras digitales,
inversiones y cajas de los locales en una única PWA con scrapers automáticos.

## Qué hace

- **Cuentas integradas**: Galicia (CC ARS, CA USD, FIMA ARS/USD, Títulos ARS/USD,
  Plazo Fijo ARS/USD), Mercado Pago (Locales + Web), PPI (ARS + USD), Cajas de los
  3 locales (Alcorta, Unicenter, Oficina).
- **Movimientos** consolidados con categorías, transferencias entre cuentas,
  detalle de contraparte (CUIT/CBU/razón social), notas.
- **Saldos en tiempo real**: cada scraper actualiza `saldo_banco_actual` con el saldo
  que reporta el banco, y la función `tesoreria_saldo_cuenta` lo prioriza si está
  fresco (< 7 días).
- **Inversiones**: drill-down dashboard con cards virtuales "Inversiones Pesos" e
  "Inversiones Dólares" que se abren en 3 cards por tipo (FIMA/Títulos/PF).
- **Tenencias** detalladas por fondo (cuotapartes + valor unidad + valor a mercado).

## Stack

- **Frontend**: `index.html` (PWA single-file, vanilla JS + Supabase JS SDK).
  GitHub Pages → https://claudiaadornosrl-prog.github.io/tesoreria-adorno/
- **Backend**: Supabase (proyecto `kwwiykssrpabncpqtmwi`).
- **Scrapers**: Python en `scrapers/` corriendo via Windows Task Scheduler.
- **Edge Functions**: Deno (TS) en `supabase/functions/`.

## Estructura del repo

```
tesoreria-adorno/
├── index.html              # PWA completa
├── service-worker.js       # cache versionado
├── manifest.webmanifest    # PWA install
├── deploy.ps1              # commit + push a GitHub Pages
├── sql/                    # migrations (gitignored — solo local)
│   ├── 00_install.sql      # schema base
│   ├── 01_seed.sql         # cuentas + categorías seed
│   ├── 02_login_setup.sql  # RLS + roles
│   ├── 03_sync_caja_desde_ventas.sql  # trigger ventas → caja
│   ├── 04_pendientes_cheques.sql
│   ├── 05_dedup_scraper.sql
│   ├── 06_paste_tabla_banco.sql
│   ├── 07_view_saldo.sql
│   └── 08_post_jun15.sql   # schema vivo aplicado el 15/06
├── scrapers/               # gitignored
│   ├── main.py             # loop polling
│   ├── scraper_common.py   # helpers Supabase + upsert MERGE
│   ├── scraper_galicia.py  # Playwright
│   ├── scraper_mp.py       # API REST
│   ├── scraper_ppi.py      # SDK ppi-client
│   ├── .env                # credenciales (NUNCA commitear)
│   └── _state_galicia/     # browser context persistente
└── supabase/functions/
    └── sync-mp-on-demand/  # edge function para refrescar pagos al cerrar turno
```

## Cómo correr en local

### Scrapers (Windows + Python)

```powershell
cd C:\CRM_Adorno\tesoreria-adorno\scrapers
pip install -r requirements.txt  # playwright, requests, ppi-client
playwright install chromium

# Manual (un servicio):
py scraper_galicia.py
py scraper_mp.py mp_locales
py scraper_ppi.py

# Loop polling según frecuencia configurada:
py main.py
```

### Tasks Windows (programados)

Configurados via Task Scheduler:

| Tarea | Comando | Frecuencia |
|---|---|---|
| Tesoreria_Galicia | `py scraper_galicia.py` | cada 4hs |
| Tesoreria_MP_Pagos | `py scraper_mp.py mp_locales` | cada hora |
| Tesoreria_MP_Release | `py scraper_mp.py mp_locales_release` | diario 03:00 |
| Tesoreria_PPI | `py scraper_ppi.py` | diario 03:00 |

### Deploy

```powershell
cd C:\CRM_Adorno\tesoreria-adorno
git add index.html service-worker.js
git commit -m "vXX: ..."
git push  # GitHub Pages deploya solo en ~2 min
```

Hard refresh en navegador: `Ctrl+Shift+R`.

## Conceptos clave

### Patrón `saldo_banco_actual`

Cada scraper, al final del run, actualiza `tesoreria_cuentas.saldo_banco_actual`
con el saldo que reporta el banco/MP/PPI. La función SQL `tesoreria_saldo_cuenta(id)`
lo prioriza cuando está fresco (< 7 días), sino fallback a `sum(importe) + offset_ancla`.

Ventaja: la PWA siempre muestra el saldo "real" sin acumular drift de movimientos
mal cargados o discrepancias de timing.

### MERGE en `upsert_movimientos`

`scraper_common.py:upsert_movimientos()` no usa el `ON CONFLICT DO NOTHING`. Si el
hash externo ya existe, hace **PATCH** actualizando `saldo_post`, `extra`,
`descripcion`, `importe`, `fecha`, `local`, `canal`. Esto permite que cuando
Galicia recalcule saldos después de acreditarse un cheque pendiente, los movimientos
viejos se actualicen en lugar de duplicarse.

### Hash sin saldo (Galicia)

El hash externo de Galicia es `fecha + descripción + importe + comprobante` (sin
saldo). Razón: cuando un Echeq pendiente se acredita, Galicia reordena las filas
y recalcula el saldo de cada mov. Si el hash incluía saldo, el mismo evento se
duplicaría. Aceptamos el riesgo bajo de colisión por 2 movs idénticos en el mismo día.

### Cheques "Pendientes"

El scraper Galicia detecta filas con el chip "Pendiente" (Echeq 48hs en clearing)
y NO las carga. Cuando se acreditan vienen como mov real con la descripción
definitiva, sin duplicar.

### Saldo disponible vs pendiente (MP)

MP devuelve 403 al endpoint `/balance`. Workaround: cada payment trae
`money_release_date` (cuándo se libera). Calculamos:
- **Pendiente** = SUM(importe) WHERE money_release_date > hoy
- **Disponible** = Total − Pendiente

Se guarda en `saldo_banco_actual` (disponible) y `saldo_banco_pendiente`.

## Tablas Supabase

| Tabla | Rol |
|---|---|
| `tesoreria_cuentas` | Catálogo de cuentas (bancarias, MP, PPI, cajas) |
| `tesoreria_movimientos` | Movs con hash_externo para dedup |
| `tesoreria_categorias` | Categorización de movs |
| `tesoreria_tenencias` | Posiciones individuales (FCI, bonos, acciones) por cuenta |
| `tesoreria_scrapers` | Estado de cada scraper (último run, frecuencia, credenciales) |
| `tesoreria_pendientes` | Cheques/movs pendientes de firma o aprobación |
| `tesoreria_movimientos_view` | View con saldo_post calculado y join a cuenta/categoría |
| `tesoreria_saldos` | View con saldo agregado por cuenta (usa tesoreria_saldo_cuenta) |

## Troubleshooting

### "Galicia no scrapea"
1. Mirá `scrapers/_state_galicia/login_fail.png` — capaz pidió 2FA.
2. Si pidió 2FA: borrar `_state_galicia/` y correr `py scraper_galicia.py`
   con HEADLESS=0 para resolverlo manual.
3. Si rompió por cambio de DOM: chequear screenshot `inversiones_no_cargo.png`
   y actualizar selectores en `_capturar_inversiones`.

### "MP devuelve 403"
- El endpoint `/users/{id}/mercadopago_account/balance` requiere scopes OAuth.
  Estamos usando el calculo por `money_release_date` que no necesita ese scope.
  Si vuelve a fallar `/v1/payments/search`: rotar access token (vencimiento por
  inactividad de la app en developers panel).

### "Saldo de la PWA no coincide con el banco"
1. Chequear `saldo_banco_at` de la cuenta:
   ```sql
   SELECT nombre, saldo_banco_actual, saldo_banco_at
   FROM tesoreria_cuentas WHERE nombre = '<X>';
   ```
2. Si `saldo_banco_at > 7 días atrás`: el scraper no corre, cae al fallback
   histórico (que puede divergir).
3. Si `saldo_banco_at` está fresco pero el saldo está mal: el scraper se debe
   estar autenticando OK pero parseando algo distinto. Correr con `HEADLESS=0`
   y verificar.

### "PWA muestra `-$61M` en una cuenta"
- La función `tesoreria_saldo_cuenta` cae al fallback porque `saldo_banco_actual`
  está null o desactualizado. El cálculo histórico sin un ancla correcto da
  basura. Fix: correr el scraper de esa cuenta o setear un ancla manual via
  el botón 🎯 en la PWA.

### "Falta una columna en la PWA después de un ALTER TABLE"
- Las views fijan columnas al crearse (incluso con `SELECT m.*`). Recrear con:
  ```sql
  DROP VIEW tesoreria_movimientos_view CASCADE;
  -- Reaplicar el CREATE VIEW de sql/08_post_jun15.sql
  ```

## Pendientes activos

- **MP Web**: sin API admin todavía (JP es colaborador). Parser de mails mensuales.
- **Rotar `SUPABASE_SERVICE_ROLE_KEY`**: leak en chat previo, alta prioridad.
- **`tesoreria_pendientes` y `tesoreria_cheques`**: tablas existen sin UI — decidir
  si feature pendiente o código muerto.
- **Healthcheck scrapers**: alertar si `ultimo_run + frecuencia + 1h < NOW()`.
- **Hardcoded mappings MP**: STORE_A_LOCAL/POS_NAMES duplicados en scraper_mp.py
  y `sync-mp-on-demand/index.ts`. Centralizar en tabla.

Ver `C:\CRM_Adorno\SESSIONS.md` para historial de cambios.
