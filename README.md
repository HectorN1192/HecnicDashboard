# HecnicDashboard

Portal interno accesible por IP para centralizar el acceso a todos los proyectos de Hecnic. Construido con Astro y Node.js.

## Características

- **Tarjetas de proyectos** — Nombre, descripción, enlace directo y estado en vivo
- **Estado en tiempo real** — Conecta al Docker socket para mostrar qué contenedores están activos
- **Fácil de extender** — Editar `src/data/projects.ts` para añadir nuevos proyectos
- **Responsive** — Funciona en desktop, tablet y mobile

## Acceso

```
https://hdashboard.construccioneshecnic.es
```

## Desarrollo

### Instalar dependencias

```bash
npm install
```

### Servir en local

```bash
npm run dev
```

Abre http://localhost:4321 (puerto por defecto de Astro)

### Build

```bash
npm run build
```

El resultado SSR (server + adaptador Node) va a `dist/`.

## Despliegue

El dashboard está dockerizado. Deploy manual e independiente desde este repo:

```bash
./deploy.sh
```

También se despliega automáticamente al hacer push a `main` (GitHub Actions). El servicio `dashboard` está definido en el `docker-compose` de HecnicApp; ambos flujos ejecutan `docker compose up -d --build dashboard` en el VPS.

### Estructura Docker

- **Puerto interno:** 4321
- **Puerto host:** 8082
- **Caddy routing:** `hdashboard.construccioneshecnic.es` → localhost:8082 (sin strip de prefijo)

## Configuración

### Añadir un proyecto

Edita `src/data/projects.ts`:

```ts
export const projects: Project[] = [
  // ... proyectos existentes
  {
    name: "Mi Nuevo Proyecto",
    description: "Descripción del proyecto",
    url: "https://ejemplo.com",
    container: "mi-contenedor",  // o null si no tiene servicio
    tag: "En desarrollo",
    accent: "#3b82f6",           // color de acento de la tarjeta
  },
];
```

Redeploy para que los cambios se vean.

### API de Estado

El endpoint `/api/status.json` devuelve el estado de todos los contenedores (Docker Engine API `GET /v1.44/containers/json?all=true` vía socket):

```json
{
  "hecnic-web": "running",
  "hecnic-api": "running",
  "hecnic-landing": "running",
  "hecnic-mysql": "running"
}
```

Se llama automáticamente desde el cliente cada 30 segundos para actualizar los indicadores de estado.

## Seguridad

- El Docker socket se monta en modo **read-only**
- No hay autenticación (seguridad por oscuridad — solo accesible por IP sin dominio público)
- El contenedor no puede crear, modificar ni eliminar contenedores

## Troubleshooting

### El estado no se actualiza

Verifica que el Docker socket sea accesible desde el contenedor:

```bash
ssh ubuntu@51.255.197.166
docker exec hecnic-dashboard curl --unix-socket /var/run/docker.sock http://v1.41/containers/json
```

Si devuelve un error de permisos, revisar que el volumen del socket esté montado correctamente en el servicio `dashboard` del `docker-compose` de HecnicApp.

### El contenedor no inicia

Revisa los logs:

```bash
ssh ubuntu@51.255.197.166
docker logs hecnic-dashboard
```

Asegúrate de que `npm install` y `npm run build` completaron sin errores durante el build del Docker.
