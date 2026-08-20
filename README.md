# HecnicDashboard

Portal interno accesible por IP para centralizar el acceso a todos los proyectos de Hecnic. Construido con Astro y Node.js.

## Características

- **Tarjetas de proyectos** — Nombre, descripción, enlace directo y estado en vivo
- **Estado en tiempo real** — Conecta al Docker socket para mostrar qué contenedores están activos
- **Fácil de extender** — Editar `src/data/projects.ts` para añadir nuevos proyectos
- **Responsive** — Funciona en desktop, tablet y mobile

## Acceso

```
http://51.255.197.166/dashboard
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

Abre http://localhost:3000 (o el puerto que indique Astro)

### Build

```bash
npm run build
```

El resultado estático va a `dist/`.

## Despliegue

El dashboard está dockerizado y se despliega automáticamente con:

```bash
./deploy.sh
```

en el directorio `HecnicApp/`.

### Estructura Docker

- **Puerto interno:** 4321
- **Puerto host (loopback):** 127.0.0.1:8082
- **Caddy routing:** `51.255.197.166/dashboard` → localhost:8082

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
  },
];
```

Redeploy para que los cambios se vean.

### API de Estado

El endpoint `/dashboard/api/status.json` devuelve el estado de todos los contenedores:

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

Si devuelve un error de permisos, revisar que el volumen esté montado correctamente en `compose.yaml`.

### El contenedor no inicia

Revisa los logs:

```bash
ssh ubuntu@51.255.197.166
docker logs hecnic-dashboard
```

Asegúrate de que `npm install` y `npm run build` completaron sin errores durante el build del Docker.
