export interface Project {
  name: string;
  description: string;
  url: string | null;
  container: string | null;
  tag: 'Producción' | 'En desarrollo' | 'Archived';
  accent: string;
}

export const projects: Project[] = [
  {
    name: 'HecnicApp',
    description: 'App de gestión interna para Construcciones Hecnic',
    url: 'https://construccioneshecnic.es/app',
    container: 'hecnic-web',
    tag: 'Producción',
    accent: '#3b82f6',
  },
  {
    name: 'HecnicWeb',
    description: 'Landing page pública de Construcciones Hecnic',
    url: 'https://construccioneshecnic.es',
    container: 'hecnic-landing',
    tag: 'Producción',
    accent: '#06b6d4',
  },
  {
    name: 'HFinanzas',
    description: 'Gestión de finanzas personales',
    url: 'https://hfinanzas.construccioneshecnic.es',
    container: 'hfinance-web',
    tag: 'En desarrollo',
    accent: '#22c55e',
  },
  {
    name: 'HFitness',
    description: 'Tracking de entrenamientos con sync Strava/Garmin',
    url: 'https://hfitness.construccioneshecnic.es',
    container: 'hfitness-web',
    tag: 'En desarrollo',
    accent: '#f97316',
  },
];
