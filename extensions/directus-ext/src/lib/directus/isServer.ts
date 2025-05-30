export function isServer() {
  return process.argv[3] === 'start';
}
