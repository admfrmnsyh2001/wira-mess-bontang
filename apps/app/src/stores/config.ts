export const config = {
  dev: false,
  baseUrl: '/',
  authDomain: 'simplo.id',
  directusUrl: `https://${location.hostname}:8443`,
  directusStaticToken: '',
};

export async function putConfig(url = '/config.json') {
  console.info('put config from url:', url);
  const resp = await fetch(url);
  const body = await resp.json();
  Object.assign(config, body);
}
