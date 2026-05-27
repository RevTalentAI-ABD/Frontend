export function getApiRoot() {
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8090';
}

export function getApiBase() {
  return `${getApiRoot()}/api`;
}
