export interface Project {
  name: string;
  description: string;
  url: string | null;
  container: string | null;
  tag: 'Producción' | 'En desarrollo' | 'Archived';
}

export const projects: Project[] = [
  {
    name: 'HecnicApp',
    description: 'App de gestión interna para Construcciones Hecnic',
    url: 'https://construccioneshecnic.es/app',
    container: 'hecnic-web',
    tag: 'Producción',
  },
  {
    name: 'HecnicWeb',
    description: 'Landing page pública de Construcciones Hecnic',
    url: 'https://construccioneshecnic.es',
    container: 'hecnic-landing',
    tag: 'Producción',
  },
  {
    name: 'CuentasPersonales',
    description: 'Gestión de finanzas personales',
    url: null,
    container: null,
    tag: 'En desarrollo',
  },
];
