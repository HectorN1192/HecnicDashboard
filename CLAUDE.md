# CLAUDE.md — HecnicDashboard

Portal interno que centraliza el acceso a todos los proyectos personales y de empresa. Muestra una tarjeta por proyecto con nombre, descripción, enlace directo y estado en vivo del contenedor Docker asociado. Sin autenticación (seguridad por oscuridad).

**Repo:** `HectorN1192/HecnicDashboard`
**URL producción:** `https://hdashboard.construccioneshecnic.es`
**VPS:** `ssh ubuntu@51.255.197.166` · dir `/home/ubuntu/HDashboard` · contenedor `hecnic-dashboard` · puerto host `8082`

---

## Stack exacto

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Astro (SSR, `output: 'server'`) | 4.16.x (`package.json` fija `^4.15.0`) |
| Adaptador | `@astrojs/node` modo `standalone` | 7.0.x |
| Runtime | Node.js | 22 (imagen `node:22-alpine`) |
| Estilos | CSS puro inline en `index.astro` (variables CSS, sin framework) | — |
| Interactividad | JavaScript vanilla en el cliente | — |
| TypeScript | config `astro/tsconfigs/strict` | — |

> No hay Tailwind ni ningún framework CSS configurado. Los estilos viven en un `<style is:inline>` dentro de `src/pages/index.astro`.

---

## Qué hace (funcional)

- Renderiza una rejilla de tarjetas de proyecto. Los datos de los proyectos se serializan a JSON en un `<script id="projects-data">` y el cliente construye las tarjetas con JS (no se usa renderizado en servidor de las tarjetas).
- Cada tarjeta muestra: iniciales como icono, nombre, etiqueta de estado del proyecto (`Producción` / `En desarrollo` / `Archived`), descripción, badge de estado del contenedor (Activo / Detenido / Error / Sin servicio) y botón "Abrir" al `url` (si existe).
- **Estado en vivo:** al cargar y luego cada 30 s, el cliente hace `fetch('/api/status.json')` y colorea el badge de cada tarjeta según el estado real del contenedor. El punto verde de "Activo" pulsa (animación CSS).
- **Tema claro/oscuro:** toggle basado en `localStorage` con fallback a `prefers-color-scheme` (variables CSS `html.dark`). El estado se lee en el arranque; el botón de toggle está definido en CSS pero el marcado del header no se emite actualmente.
- Pie de página con marca de "Última actualización" (hora local `es-ES`).

---

## Estructura real

```
astro.config.mjs             # output: 'server', adapter node standalone
Dockerfile                   # build multistage → runtime node:22-alpine, PORT=4321
deploy.sh                    # deploy independiente al VPS
.github/workflows/deploy.yml # CI: push a main → deploy automático
src/
├── pages/
│   ├── index.astro          # Página única: estilos, marcado y JS de cliente
│   └── api/
│       └── status.json.ts   # GET SSR: estado de contenedores vía Docker socket
├── components/
│   └── ProjectCard.astro    # NO se usa (ver nota abajo)
├── data/
│   └── projects.ts          # Lista de proyectos (editable)
└── env.d.ts
```

> **`ProjectCard.astro` no está enganchado.** No lo importa nadie: `index.astro` genera las tarjetas en cliente desde el JSON. El componente usa clases utilitarias tipo Tailwind que no tienen efecto (no hay Tailwind). Se conserva como referencia; editar `index.astro` para cambiar el marcado de las tarjetas.

---

## Configuración de proyectos (`src/data/projects.ts`)

Array de objetos `Project`:

```ts
interface Project {
  name: string;
  description: string;
  url: string | null;        // null si aún sin URL
  container: string | null;  // nombre del contenedor para estado; null = "Sin servicio"
  tag: 'Producción' | 'En desarrollo' | 'Archived';
  accent: string;            // color hex de acento de la tarjeta (ej. '#3b82f6')
}
```

Proyectos actualmente listados:

| name | url | container | tag |
|---|---|---|---|
| HecnicApp | `construccioneshecnic.es/app` | `hecnic-web` | Producción |
| HecnicWeb | `construccioneshecnic.es` | `hecnic-landing` | Producción |
| HFinanzas | `hfinanzas.construccioneshecnic.es` | `hfinance-web` | En desarrollo |
| HFitness | `hfitness.construccioneshecnic.es` | `hfitness-web` | En desarrollo |

Tras editar, hacer redeploy para que se reflejen los cambios.

---

## Endpoint `/api/status.json`

- **Tipo:** GET, SSR (`src/pages/api/status.json.ts`).
- **Origen de datos:** Unix socket `/var/run/docker.sock`, llamada a la Docker Engine API `GET /v1.44/containers/json?all=true`.
- **Respuesta 200:** JSON `{ "<nombreContenedor>": "<State>", ... }` con todos los contenedores (nombre sin la `/` inicial). `State` es el crudo de Docker: `running`, `exited`, `created`, `restarting`, etc.
- **Respuesta 500:** `{ "error": "Unable to query Docker daemon" }` si el socket no responde.
- El cliente mapea `running` → Activo, `exited` → Detenido, cualquier otro valor presente → Error, y ausente / `container: null` → Sin servicio.

---

## Seguridad

- El Docker socket se monta **read-only** (`:ro`). Solo lectura de estado, sin crear/parar/borrar contenedores.
- Sin autenticación. Acceso protegido solo por no estar difundido públicamente.
- Sin datos sensibles ni base de datos.

---

## Docker

- **Dockerfile:** build multistage. Etapa `build` (`node:22-alpine`) hace `npm ci` + `npm run build`; etapa final copia `dist/` y `node_modules`, expone `4321` y arranca con `node ./dist/server/entry.mjs`.
- **Puerto interno:** 4321 (`ENV HOST=0.0.0.0 PORT=4321`).
- El **servicio `dashboard`** (contenedor `hecnic-dashboard`, publicación a puerto host `8082`, montaje del socket, `restart`) está definido en el `docker-compose` de **HecnicApp**, no en este repo. Ambos scripts de deploy hacen `cd /home/ubuntu/hecnicapp && docker compose up -d --build dashboard`.

---

## Routing (Caddy)

- Acceso por subdominio: `hdashboard.construccioneshecnic.es`.
- Caddy hace `reverse_proxy` a `localhost:8082`. Sin strip de prefijo.
- **Base URL en Astro:** `/` (raíz, sin base path). Por eso las rutas son `/` y `/api/status.json`, no `/dashboard/...`.

---

## Despliegue

### Manual (independiente)

```bash
./deploy.sh
```

`deploy.sh` sincroniza este repo vía rsync a `/home/ubuntu/HDashboard` (excluye `.git`, `node_modules`, `dist`, `.astro`, `.env`) y reconstruye solo el contenedor `dashboard` (`docker compose up -d --build dashboard` dentro de `hecnicapp`), luego `docker image prune -f`. No toca otros servicios.

### Automático (CI/CD)

Push a `main` → GitHub Actions (`.github/workflows/deploy.yml`): rsync al VPS + `docker compose up -d --build dashboard` + verificación con `docker ps`. Requiere los secrets `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`.

---

## Desarrollo local

```bash
npm install
npm run dev      # Astro dev, puerto 4321 por defecto
```

## Build local

```bash
npm run build    # compila a dist/ (server SSR + node standalone)
npm start        # node ./dist/server/entry.mjs, puerto 4321
```

> `/api/status.json` en local intentará leer `/var/run/docker.sock`; devolverá 500 si Docker no está disponible. La página sigue cargando y muestra las tarjetas como "Sin servicio".

---

## Notas

- No hay tests (misma política que HecnicApp).
- No hay `AGENTS.md` en este repo.
- Ideas futuras: autenticación (middleware de sesión), filtrado por rol, persistencia de historial/alertas.
