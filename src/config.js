// App configuration. Values that must stay out of Git live in .env.
// Import (don't `export { … } from '@env'`) so Babel inlines the value.
import { MAPBOX_PUBLIC_TOKEN as mapboxPublicToken } from '@env';

export const MAPBOX_PUBLIC_TOKEN = mapboxPublicToken;
export const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/streets-v12';
