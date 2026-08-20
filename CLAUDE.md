# CLAUDE.md — HecnicDashboard

Portal interno accesible por IP (sin dominio ni autenticación) que centraliza el acceso a todos los proyectos personales y de empresa.

## Stack

- **Framework:** Astro 4.x (SSR con adaptador Node.js)
- **Runtime:** Node.js 22 LTS
- **Estilo:** HTML + CSS puro (sin frameworks CSS, estilos inline simples)
- **Interactividad:** Vanilla JavaScript en el cliente

## Objetivo

Proporcionar un punto único de entrada a todos los proyectos con:
- Listado de tarjetas por proyecto
- Nombre, descripción, link directo y estado en vivo
- Verificación de estado mediante lectura del Docker socket (read-only)

## Estructura

```
src/
├── pages/
│   ├── index.astro          # Página principal del dashboard
│   └── api/
│       └── status.json.ts   # Endpoint: estado de contenedores Docker
├── components/
│   └── ProjectCard.astro    # Tarjeta reutilizable de proyecto
└── data/
    └── projects.ts          # Config de proyectos (editable por usuario)
```

## Configuración de proyectos

Editar `src/data/projects.ts` para añadir/modificar proyectos. Array de objetos con estructura fija:

```ts
interface Project {
  name: string;
  description: string;
  url: string | null;        // null si proyecto aún sin URL
  container: string | null;  // nombre del contenedor para estado, null sin servicio
  tag: 'Producción' | 'En desarrollo' | 'Archived';
}
```

## Endpoint `/api/status.json`

- **Tipo:** GET, SSR
- **Origen de datos:** Unix socket `/var/run/docker.sock` (read-only)
- **Respuesta:** JSON con pares `{containerName: state}`
- **Valores de state:** `running`, `exited`, `stopped`, etc.
- **Uso:** Cliente hace fetch al cargar la página y cada 30 segundos

## Seguridad

- Docker socket montado **read-only** — solo lectura, sin permisos de escritura/creación
- Sin autenticación — seguridad por oscuridad (accesible solo por IP, sin dominio público)
- Sin datos sensibles almacenados

## Docker

- **Dockerfile:** Build multistage (compilación Astro + runtime Node.js ligero)
- **Puerto interno:** 4321
- **Volumen:** `/var/run/docker.sock:ro` (read-only, para consultar estado)
- **Restart:** unless-stopped

## Routing

- **Acceso:** `http://51.255.197.166/dashboard`
- **Caddy config:** Bloque IP `51.255.197.166 { handle /dashboard* { ... } }` en Caddyfile
- **Base URL en Astro:** `/dashboard` (ver `astro.config.mjs`)

## Despliegue

Incluido en el script `HecnicApp/deploy.sh`:

```bash
cd HecnicApp
./deploy.sh  # Sincroniza + build + reinicia (incluyendo dashboard)
```

El servicio se reconstruye y reinicia automáticamente.

## Desarrollo local

```bash
npm install
npm run dev
```

Sirve en `http://localhost:3000` (Astro selecciona puerto automáticamente).

## Build local

```bash
npm run build
npm start
```

Compila a `dist/` y sirve con Node.js en puerto 4321.

## Consideraciones futuras

- Si se necesita autenticación, añadir middleware de verificación de sesión
- Si se necesita filtrado por rol/permisos, añadir lógica en el endpoint de estado
- Si se necesita persistencia de estado (historial, alertas), añadir base de datos pequeña
- Actualmente no hay tests (política del proyecto HecnicApp)
